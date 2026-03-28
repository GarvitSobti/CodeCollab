const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const {
  Conversation,
  ConversationParticipant,
  Match,
  Message,
  MessageReaction,
  User,
  sequelize,
} = require('../models');
const { ensureDemoMatchesForUser, normalizePair } = require('./chatSeedService');
const { fetchLinkPreview } = require('../utils/linkPreview');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

function getInitials(name = '') {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'CC';
}

function toUserSummary(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    initials: user.initials || getInitials(user.name),
    accentColor: user.accentColor || 'linear-gradient(135deg,#ff8a65,#ff6b6b)',
    university: user.university,
    year: user.year,
  };
}

function toReactionSummary(reactions = []) {
  const grouped = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        emoji: reaction.emoji,
        count: 0,
        userIds: [],
      };
    }

    acc[reaction.emoji].count += 1;
    acc[reaction.emoji].userIds.push(reaction.userId);
    return acc;
  }, {});

  return Object.values(grouped);
}

function toMessagePayload(message, currentUserId, recipientReadAt = null) {
  const sender = message.sender ? toUserSummary(message.sender) : null;
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    sender,
    body: message.body,
    messageType: message.messageType,
    attachmentUrl: message.attachmentUrl,
    attachmentName: message.attachmentName,
    attachmentMimeType: message.attachmentMimeType,
    attachmentSize: message.attachmentSize,
    linkPreview: message.linkPreviewJson,
    clientMessageId: message.clientMessageId,
    sentAt: message.sentAt,
    editedAt: message.editedAt,
    reactions: toReactionSummary(message.reactions),
    isOwnMessage: message.senderId === currentUserId,
    read: message.senderId === currentUserId && recipientReadAt
      ? new Date(message.sentAt) <= new Date(recipientReadAt)
      : false,
  };
}

async function ensureCurrentUser(authUser) {
  const shouldSeedDemoMatches = process.env.NODE_ENV !== 'production'
    && process.env.CHAT_DEMO_SEED !== 'false';

  if (shouldSeedDemoMatches) {
    await ensureDemoMatchesForUser(authUser.uid);
  }

  const [user] = await User.upsert({
    id: authUser.uid,
    firebaseUid: authUser.uid,
    email: authUser.email,
    name: authUser.name || authUser.email || 'CodeCollab User',
    avatarUrl: authUser.picture,
    role: authUser.claims?.role || 'student',
    initials: getInitials(authUser.name || authUser.email || 'CodeCollab User'),
  }, {
    returning: true,
  });

  return user;
}

async function getUserById(userId) {
  return User.findByPk(userId);
}

async function requireMatch(userId, participantUserId) {
  if (userId === participantUserId) {
    throw new Error('Cannot open a conversation with yourself');
  }

  // Allow if users have an accepted match
  const [userOneId, userTwoId] = normalizePair(userId, participantUserId);
  const match = await Match.findOne({
    where: { userOneId, userTwoId, status: 'accepted' },
  });

  if (match) return;

  // Also allow if users are members of the same team (via Prisma)
  try {
    const prisma = require('../config/prisma');
    const sharedTeam = await prisma.$queryRaw`
      SELECT tm1."teamId"
      FROM "TeamMember" tm1
      JOIN "TeamMember" tm2 ON tm1."teamId" = tm2."teamId"
      JOIN "User" u1 ON tm1."userId" = u1."id"
      JOIN "User" u2 ON tm2."userId" = u2."id"
      WHERE u1."firebaseUid" = ${userId}
        AND u2."firebaseUid" = ${participantUserId}
      LIMIT 1
    `;
    if (sharedTeam && sharedTeam.length > 0) return;
  } catch (err) {
    console.error('Team membership check failed:', err);
  }

  const error = new Error('Direct messages are limited to matched users or teammates');
  error.status = 403;
  throw error;
}

async function getParticipantRecord(conversationId, userId) {
  return ConversationParticipant.findOne({
    where: { conversationId, userId },
  });
}

async function requireConversationMembership(conversationId, userId) {
  const membership = await getParticipantRecord(conversationId, userId);

  if (!membership) {
    const err = new Error('Conversation not found');
    err.status = 404;
    throw err;
  }

  return membership;
}

async function openOrCreateDmConversation(userId, participantUserId) {
  await requireMatch(userId, participantUserId);

  const participantUser = await User.findByPk(participantUserId);

  if (!participantUser) {
    const err = new Error('Matched user not found');
    err.status = 404;
    throw err;
  }

  const existingMemberships = await ConversationParticipant.findAll({
    where: {
      userId: {
        [Op.in]: [userId, participantUserId],
      },
    },
    attributes: ['conversationId', 'userId'],
  });

  const countsByConversation = existingMemberships.reduce((acc, membership) => {
    acc[membership.conversationId] = acc[membership.conversationId] || new Set();
    acc[membership.conversationId].add(membership.userId);
    return acc;
  }, {});

  const candidateConversationIds = Object.entries(countsByConversation)
    .filter(([, userIds]) => userIds.size === 2)
    .map(([conversationId]) => conversationId);

  if (candidateConversationIds.length > 0) {
    const existing = await Conversation.findOne({
      where: {
        id: { [Op.in]: candidateConversationIds },
        type: 'dm',
      },
    });

    if (existing) {
      return existing;
    }
  }

  return sequelize.transaction(async (transaction) => {
    const conversation = await Conversation.create({
      type: 'dm',
      createdByUserId: userId,
    }, { transaction });

    await ConversationParticipant.bulkCreate([
      { conversationId: conversation.id, userId, lastReadAt: new Date(), lastDeliveredAt: new Date() },
      { conversationId: conversation.id, userId: participantUserId, lastReadAt: null, lastDeliveredAt: null },
    ], { transaction });

    return conversation;
  });
}

async function listConversations(userId) {
  const memberships = await ConversationParticipant.findAll({
    where: { userId },
    include: [
      {
        model: Conversation,
        as: 'conversation',
      },
    ],
    order: [[{ model: Conversation, as: 'conversation' }, 'lastMessageAt', 'DESC']],
  });

  const conversationIds = memberships.map((membership) => membership.conversationId);
  if (conversationIds.length === 0) {
    return [];
  }

  const participants = await ConversationParticipant.findAll({
    where: { conversationId: { [Op.in]: conversationIds } },
    include: [{ model: User, as: 'user' }],
  });

  const latestMessages = await Message.findAll({
    where: { conversationId: { [Op.in]: conversationIds } },
    include: [{ model: User, as: 'sender' }],
    order: [['sentAt', 'DESC']],
  });

  const messageMap = latestMessages.reduce((acc, message) => {
    if (!acc[message.conversationId]) {
      acc[message.conversationId] = message;
    }
    return acc;
  }, {});

  const participantsByConversation = participants.reduce((acc, membership) => {
    acc[membership.conversationId] = acc[membership.conversationId] || [];
    acc[membership.conversationId].push(membership);
    return acc;
  }, {});

  const results = await Promise.all(memberships.map(async (membership) => {
    const otherParticipantMembership = (participantsByConversation[membership.conversationId] || [])
      .find((participant) => participant.userId !== userId);
    const lastMessage = messageMap[membership.conversationId];
    const unreadCount = await Message.count({
      where: {
        conversationId: membership.conversationId,
        senderId: { [Op.ne]: userId },
        sentAt: membership.lastReadAt
          ? { [Op.gt]: membership.lastReadAt }
          : { [Op.not]: null },
      },
    });

    return {
      id: membership.conversation.id,
      type: membership.conversation.type,
      participant: otherParticipantMembership?.user ? toUserSummary(otherParticipantMembership.user) : null,
      unreadCount,
      lastActivityAt: membership.conversation.lastMessageAt || membership.conversation.createdAt,
      lastMessage: lastMessage
        ? toMessagePayload(lastMessage, userId, otherParticipantMembership?.lastReadAt || null)
        : null,
    };
  }));

  return results;
}

async function listMessages(userId, conversationId, { cursor, limit = 30 }) {
  await requireConversationMembership(conversationId, userId);
  const parsedLimit = Number.parseInt(limit, 10);
  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 50)
    : 30;
  const participants = await ConversationParticipant.findAll({
    where: { conversationId },
  });
  const recipientReadAt = participants.find((participant) => participant.userId !== userId)?.lastReadAt || null;

  const where = { conversationId };
  if (cursor) {
    const parsedCursor = new Date(cursor);
    if (Number.isNaN(parsedCursor.getTime())) {
      const err = new Error('Invalid message cursor');
      err.status = 400;
      throw err;
    }
    where.sentAt = { [Op.lt]: parsedCursor };
  }

  const messages = await Message.findAll({
    where,
    include: [
      { model: User, as: 'sender' },
      { model: MessageReaction, as: 'reactions' },
    ],
    order: [['sentAt', 'DESC']],
    limit: safeLimit,
  });

  const orderedMessages = [...messages].reverse();
  const nextCursor = messages.length === safeLimit
    ? messages[messages.length - 1].sentAt
    : null;

  return {
    messages: orderedMessages.map((message) => toMessagePayload(message, userId, recipientReadAt)),
    nextCursor,
  };
}

async function buildLinkPreview(body) {
  const match = body?.match(/https?:\/\/[^\s]+/i);
  if (!match) {
    return null;
  }

  try {
    return await fetchLinkPreview(match[0]);
  } catch (error) {
    return null;
  }
}

async function createMessage({
  conversationId,
  senderId,
  body,
  clientMessageId,
  file,
}) {
  await requireConversationMembership(conversationId, senderId);

  const trimmedBody = body?.trim() || '';
  if (!trimmedBody && !file) {
    const err = new Error('Message body or attachment is required');
    err.status = 400;
    throw err;
  }

  const linkPreview = trimmedBody ? await buildLinkPreview(trimmedBody) : null;
  const sentAt = new Date();
  const messageType = file
    ? (file.mimetype?.startsWith('image/') ? 'image' : 'file')
    : 'text';

  const message = await Message.create({
    conversationId,
    senderId,
    body: trimmedBody || null,
    messageType,
    attachmentUrl: file ? `/api/messages/uploads/${file.filename}` : null,
    attachmentName: file?.originalname || null,
    attachmentMimeType: file?.mimetype || null,
    attachmentSize: file?.size || null,
    linkPreviewJson: linkPreview,
    clientMessageId: clientMessageId || null,
    sentAt,
  });

  await Conversation.update({
    lastMessageId: message.id,
    lastMessageAt: sentAt,
  }, {
    where: { id: conversationId },
  });

  await ConversationParticipant.update({
    lastDeliveredAt: sentAt,
  }, {
    where: {
      conversationId,
      userId: { [Op.ne]: senderId },
    },
  });

  return getMessageById(message.id, senderId);
}

async function getAttachmentForUser(userId, filename) {
  const attachmentUrl = `/api/messages/uploads/${filename}`;
  const message = await Message.findOne({
    where: { attachmentUrl },
  });

  if (!message) {
    const err = new Error('Attachment not found');
    err.status = 404;
    throw err;
  }

  await requireConversationMembership(message.conversationId, userId);

  return {
    absolutePath: path.join(uploadDir, filename),
    message,
  };
}

async function getMessageById(messageId, currentUserId) {
  const message = await Message.findByPk(messageId, {
    include: [
      { model: User, as: 'sender' },
      { model: MessageReaction, as: 'reactions' },
    ],
  });

  if (!message) {
    return null;
  }

  const participants = await ConversationParticipant.findAll({
    where: { conversationId: message.conversationId },
  });
  const recipientReadAt = participants.find((participant) => participant.userId !== currentUserId)?.lastReadAt || null;
  return toMessagePayload(message, currentUserId, recipientReadAt);
}

async function markConversationRead(userId, conversationId) {
  await requireConversationMembership(conversationId, userId);
  const readAt = new Date();

  await ConversationParticipant.update({
    lastReadAt: readAt,
  }, {
    where: { conversationId, userId },
  });

  return { conversationId, userId, readAt };
}

async function toggleReaction({ userId, messageId, emoji }) {
  const message = await Message.findByPk(messageId);
  if (!message) {
    const err = new Error('Message not found');
    err.status = 404;
    throw err;
  }

  await requireConversationMembership(message.conversationId, userId);

  const existing = await MessageReaction.findOne({
    where: { messageId, userId, emoji },
  });

  if (existing) {
    await existing.destroy();
  } else {
    await MessageReaction.create({ messageId, userId, emoji });
  }

  const updatedMessage = await getMessageById(messageId, userId);
  return {
    conversationId: message.conversationId,
    message: updatedMessage,
  };
}

async function getConversationSummary(userId, conversationId) {
  await requireConversationMembership(conversationId, userId);
  const conversations = await listConversations(userId);
  return conversations.find((conversation) => conversation.id === conversationId) || null;
}

module.exports = {
  ensureCurrentUser,
  getUserById,
  listConversations,
  openOrCreateDmConversation,
  listMessages,
  createMessage,
  markConversationRead,
  toggleReaction,
  requireConversationMembership,
  getConversationSummary,
  getAttachmentForUser,
  toUserSummary,
  uploadDir,
};
