const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register-or-sync', authMiddleware, async (req, res) => {
  const { uid, email, name, picture } = req.auth;

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