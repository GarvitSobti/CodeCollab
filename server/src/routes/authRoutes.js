const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

router.post('/register-or-sync', authMiddleware, async (req, res) => {
  const { uid, email, name, picture } = req.auth;

  try {
    const [user, created] = await User.findOrCreate({
      where: { firebaseUid: uid },
      defaults: {
        email,
        name: name || null,
        avatarUrl: picture || null,
      },
    });

    if (!created) {
      await user.update({
        email,
        name: name || null,
        avatarUrl: picture || null,
      });
    }

    return res.status(created ? 201 : 200).json({
      message: created ? 'User registered' : 'User synced',
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error('register-or-sync error:', err.message);
    return res.status(500).json({
      error: { message: 'Failed to register or sync user', status: 500 },
    });
  }
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