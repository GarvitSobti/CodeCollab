const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const prisma = require('../config/prisma');

const router = express.Router();

async function syncUserProfile({ uid, email, name, picture }) {
  try {
    await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        email: email || undefined,
        name: name || email || 'CodeCollab User',
        avatarUrl: picture || null,
      },
      create: {
        firebaseUid: uid,
        email: email || `${uid}@codecollab.local`,
        name: name || email || 'CodeCollab User',
        avatarUrl: picture || null,
      },
    });
  } catch (err) {
    // Log and continue; do not fail the request just because sync failed.
    console.error('Failed to sync user profile:', err);
  }
}

async function ensureCurrentUser(authUser) {
  const { uid, email, name, picture } = authUser || {};

  if (!uid) {
    const error = new Error('Missing authenticated user id');
    error.status = 401;
    throw error;
  }

  await syncUserProfile({ uid, email, name, picture });

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });
  } catch (error) {
    // Keep request flowing even if DB sync/read is temporarily unavailable.
    console.error('Failed to fetch user via Prisma:', error);
  }

  return {
    firebaseUid: uid,
    email: user?.email || email,
    name: user?.name || name,
    avatarUrl: user?.avatarUrl || picture,
  };
}

router.post('/register-or-sync', authMiddleware, async (req, res) => {
  try {
    const user = await ensureCurrentUser(req.auth);

    return res.status(200).json({
      message: 'Firebase identity verified',
      user,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: {
        message: error.message || 'Failed to sync authenticated user',
        status: error.status || 500,
      },
    });
  }
});

router.get('/user-exists', async (req, res) => {
  const email = typeof req.query?.email === 'string' ? req.query.email.trim().toLowerCase() : '';

  if (!email) {
    return res.status(400).json({
      error: {
        message: 'Email query parameter is required',
        status: 400,
      },
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    return res.status(200).json({
      exists: Boolean(user),
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        message: 'Failed to check user existence',
        status: 500,
      },
    });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await ensureCurrentUser(req.auth);

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: {
        message: error.message || 'Failed to load authenticated user',
        status: error.status || 500,
      },
    });
  }
});

module.exports = router;
