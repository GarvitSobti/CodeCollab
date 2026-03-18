const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createMessage,
  ensureCurrentUser,
  getConversationSummary,
  listConversations,
  listMessages,
  markConversationRead,
  openOrCreateDmConversation,
  toggleReaction,
  uploadDir,
} = require('../services/chatService');
const { fetchLinkPreview } = require('../utils/linkPreview');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 40);
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Unsupported attachment type'));
    }

    return cb(null, true);
  },
});

router.use(authMiddleware);

router.get('/conversations', async (req, res, next) => {
  try {
    await ensureCurrentUser(req.auth);
    const conversations = await listConversations(req.auth.uid);
    res.json({ conversations });
  } catch (error) {
    next(error);
  }
});

router.post('/conversations/dm/open', async (req, res, next) => {
  try {
    const { participantUserId } = req.body;
    await ensureCurrentUser(req.auth);
    const conversation = await openOrCreateDmConversation(req.auth.uid, participantUserId);
    const summary = await getConversationSummary(req.auth.uid, conversation.id);
    res.status(200).json({ conversation: summary });
  } catch (error) {
    next(error);
  }
});

router.get('/conversations/:conversationId/messages', async (req, res, next) => {
  try {
    const payload = await listMessages(req.auth.uid, req.params.conversationId, {
      cursor: req.query.cursor,
      limit: req.query.limit || 30,
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post('/conversations/:conversationId/messages', upload.single('attachment'), async (req, res, next) => {
  try {
    const message = await createMessage({
      conversationId: req.params.conversationId,
      senderId: req.auth.uid,
      body: req.body.body,
      clientMessageId: req.body.clientMessageId,
      file: req.file,
    });

    const io = req.app.get('io');
    io?.to(req.params.conversationId).emit('message:new', {
      conversationId: req.params.conversationId,
      message,
    });
    io?.to(req.params.conversationId).emit('conversation:updated', {
      conversationId: req.params.conversationId,
    });

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

router.post('/conversations/:conversationId/read', async (req, res, next) => {
  try {
    const payload = await markConversationRead(req.auth.uid, req.params.conversationId);
    req.app.get('io')?.to(req.params.conversationId).emit('message:read', payload);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post('/messages/:messageId/reactions', async (req, res, next) => {
  try {
    const payload = await toggleReaction({
      userId: req.auth.uid,
      messageId: req.params.messageId,
      emoji: req.body.emoji,
    });
    req.app.get('io')?.to(payload.conversationId).emit('reaction:update', payload);
    req.app.get('io')?.to(payload.conversationId).emit('conversation:updated', {
      conversationId: payload.conversationId,
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.delete('/messages/:messageId/reactions/:emoji', async (req, res, next) => {
  try {
    const payload = await toggleReaction({
      userId: req.auth.uid,
      messageId: req.params.messageId,
      emoji: req.params.emoji,
    });
    req.app.get('io')?.to(payload.conversationId).emit('reaction:update', payload);
    req.app.get('io')?.to(payload.conversationId).emit('conversation:updated', {
      conversationId: payload.conversationId,
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/link-preview', async (req, res, next) => {
  try {
    const preview = await fetchLinkPreview(req.query.url);
    res.json({ preview });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
