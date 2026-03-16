const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const USERS_DATA_FILE = path.join(__dirname, '..', 'data', 'users.json');

async function syncUserProfile({ uid, email, name, picture }) {
  try {
    // Ensure the data directory exists
    const dataDir = path.dirname(USERS_DATA_FILE);
    await fs.promises.mkdir(dataDir, { recursive: true });

    let users = [];

    try {
      const existing = await fs.promises.readFile(USERS_DATA_FILE, 'utf8');
      users = JSON.parse(existing);
      if (!Array.isArray(users)) {
        users = [];
      }
    } catch (readErr) {
      // If the file does not exist or is invalid, start with an empty list.
      users = [];
    }

    const firebaseUid = uid;
    const updatedUser = {
      firebaseUid,
      email: email || null,
      name: name || null,
      avatarUrl: picture || null,
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = users.findIndex((u) => u.firebaseUid === firebaseUid);

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...updatedUser };
    } else {
      users.push({
        ...updatedUser,
        createdAt: new Date().toISOString(),
      });
    }

    await fs.promises.writeFile(USERS_DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    // Log and continue; do not fail the request just because sync failed.
    console.error('Failed to sync user profile:', err);
  }
}

router.post('/register-or-sync', authMiddleware, async (req, res) => {
  const { uid, email, name, picture } = req.auth;

  await syncUserProfile({ uid, email, name, picture });

  return res.status(200).json({
    message: 'Firebase identity verified',
    user: {
      firebaseUid: uid,
      email,
      name,
      avatarUrl: picture,
    },
  });
});

router.get('/me', authMiddleware, async (req, res) => {
  const { uid, email, name, picture } = req.auth;

  return res.status(200).json({
    user: {
      firebaseUid: uid,
      email,
      name,
      avatarUrl: picture,
    },
  });
});

module.exports = router;