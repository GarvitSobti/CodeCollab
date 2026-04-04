const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/v1/notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.auth.uid } });
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const unreadMatchCount = notifications.filter((n) => !n.isRead && n.type === 'NEW_MATCH').length;

    return res.json({ notifications, unreadCount, unreadMatchCount });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch notifications', status: 500 } });
  }
});

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.auth.uid } });
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to mark notifications read:', error);
    return res.status(500).json({ error: { message: 'Failed to mark notifications read', status: 500 } });
  }
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.auth.uid } });
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: user.id },
      data: { isRead: true },
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to mark notification read:', error);
    return res.status(500).json({ error: { message: 'Failed to mark notification read', status: 500 } });
  }
});

module.exports = router;
