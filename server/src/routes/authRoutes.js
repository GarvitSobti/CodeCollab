const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { ensureCurrentUser } = require('../services/chatService');

const router = express.Router();

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

    return res.status(200).json({
      user,
    });
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
