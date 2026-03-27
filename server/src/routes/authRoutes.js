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

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await ensureCurrentUser(req.auth);

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });
  } catch (error) {
    console.error('Failed to fetch user via Prisma:', error);
  }

  return res.status(200).json({
    user: {
      firebaseUid: uid,
      email: user?.email || email,
      name: user?.name || name,
      avatarUrl: user?.avatarUrl || picture,
    },
  });
});

module.exports = router;
