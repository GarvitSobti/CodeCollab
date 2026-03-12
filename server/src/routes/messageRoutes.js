const express = require('express');
const router = express.Router();
const { getMessages, addMessage } = require('../socket/chatHandlers');

// GET /api/messages/:roomId — fetch message history
router.get('/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { limit = 50, before } = req.query;

  let messages = getMessages(roomId);

  if (before) {
    messages = messages.filter(m => m.timestamp < Number(before));
  }

  // Return last N messages (pagination)
  const paginated = messages.slice(-Number(limit));

  res.json({ roomId, messages: paginated, total: messages.length });
});

// POST /api/messages/:roomId — HTTP fallback for sending (socket is preferred)
router.post('/:roomId', (req, res) => {
  const { roomId } = req.params;
  const { text, senderId, time } = req.body;

  if (!text?.trim() || !senderId) {
    return res.status(400).json({ error: 'text and senderId are required' });
  }

  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    text: text.trim(),
    senderId,
    time: time || new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
    read: false,
    timestamp: Date.now(),
  };

  addMessage(roomId, message);

  // Emit via socket if io is available
  const io = req.app.get('io');
  if (io) {
    io.to(roomId).emit('new-message', { roomId, message });
  }

  res.status(201).json({ message });
});

module.exports = router;
