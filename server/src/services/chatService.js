const path = require('path');
const fs = require('fs');
const prisma = require('../config/prisma');
const { ensureDemoMatchesForUser } = require('./chatSeedService');
const { normalizePair } = require('../utils/matchUtils');
const { fetchLinkPreview } = require('../utils/linkPreview');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    id: user.firebaseUid,
    profileId: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: 'student',
    initials: getInitials(user.name),
    accentColor: 'linear-gradient(135deg,#ff8a65,#ff6b6b)',
    university: user.university,
    year: user.profile?.academicYear || null,
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

// ── User management ─────────────────────────────────────────────────────────

async function ensureCurrentUser(authUser) {
  const shouldSeedDemoMatches = process.env.NODE_ENV !== 'production'
    && process.env.CHAT_DEMO_SEED !== 'false';

  if (shouldSeedDemoMatches) {
    try {
      await ensureDemoMatchesForUser(authUser.uid);
    } catch (err) {
      console.warn('[chatSeed] Demo seed skipped:', err.message);
    }
  }

  const user = await prisma.user.findUnique({ where: { firebaseUid: authUser.uid } });
  return user;
}

async function getUserById(userId) {
  return prisma.user.findUnique({ where: { firebaseUid: userId } });
}

// ── Team conversation sync ──────────────────────────────────────────────────

async function syncTeamConversations(userId) {
  try {
    const prismaUser = await prisma.user.findUnique({ where: { firebaseUid: userId } });
    if (!prismaUser) return;

    const memberships = await prisma.teamMember.findMany({
      where: { userId: prismaUser.id },
      include: {
        team: {
          include: {
            members: {
              include: { user: true },
            },
          },
        },
      },
    });

    for (const membership of memberships) {
      const team = membership.team;

      const conversation = await prisma.conversation.upsert({
        where: { teamId: team.id },
        update: { name: team.name },
        create: {
          type: 'TEAM',
          name: team.name,
          teamId: team.id,
          createdByUserId: userId,
        },
      });

      const teamFirebaseUids = new Set();
      for (const member of team.members) {
        const uid = member.user.firebaseUid;
        teamFirebaseUids.add(uid);

        const existing = await prisma.conversationParticipant.findUnique({
          where: { conversationId_userId: { conversationId: conversation.id, userId: uid } },
        });
        if (!existing) {
          await prisma.conversationParticipant.create({
            data: {
              conversationId: conversation.id,
              userId: uid,
            },
          });
        }
      }

      const allParticipants = await prisma.conversationParticipant.findMany({
        where: { conversationId: conversation.id },
      });
      for (const participant of allParticipants) {
        if (!teamFirebaseUids.has(participant.userId)) {
          await prisma.conversationParticipant.delete({
            where: { id: participant.id },
          });
        }
      }
    }
  } catch (err) {
    console.error('syncTeamConversations error (non-fatal):', err.message);
  }
}

// ── Match gating ────────────────────────────────────────────────────────────

async function requireMatch(userId, participantUserId) {
  if (userId === participantUserId) {
    throw new Error('Cannot open a conversation with yourself');
  }

  const [userOneId, userTwoId] = normalizePair(userId, participantUserId);
  const match = await prisma.match.findUnique({
    where: { userOneId_userTwoId: { userOneId, userTwoId } },
  });

  if (match && match.status === 'accepted') return;

  // Also allow if users are members of the same team
  try {
    const user1 = await prisma.user.findUnique({ where: { firebaseUid: userId }, select: { id: true } });
    const user2 = await prisma.user.findUnique({ where: { firebaseUid: participantUserId }, select: { id: true } });

    if (user1 && user2) {
      const sharedTeam = await prisma.teamMember.findFirst({
        where: {
          userId: user1.id,
          team: { members: { some: { userId: user2.id } } },
        },
      });
      if (sharedTeam) return;
    }
  } catch (err) {
    console.error('Team membership check failed:', err);
  }

  const error = new Error('Direct messages are limited to matched users or teammates');
  error.status = 403;
  throw error;
}

// ── Conversation membership ─────────────────────────────────────────────────

async function getParticipantRecord(conversationId, userId) {
  return prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
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

// ── DM conversations ────────────────────────────────────────────────────────

async function openOrCreateDmConversation(userId, participantUserId) {
  await requireMatch(userId, participantUserId);

  const participantUser = await prisma.user.findUnique({
    where: { firebaseUid: participantUserId },
  });

  if (!participantUser) {
    const err = new Error('Matched user not found');
    err.status = 404;
    throw err;
  }

  // Find existing DM between these two users
  const existingMemberships = await prisma.conversationParticipant.findMany({
    where: { userId: { in: [userId, participantUserId] } },
    select: { conversationId: true, userId: true },
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
    const existing = await prisma.conversation.findFirst({
      where: {
        id: { in: candidateConversationIds },
        type: 'DM',
      },
    });

    if (existing) return existing;
  }

  return prisma.$transaction(async (tx) => {
    const conversation = await tx.conversation.create({
      data: {
        type: 'DM',
        createdByUserId: userId,
      },
    });

    await tx.conversationParticipant.createMany({
      data: [
        { conversationId: conversation.id, userId, lastReadAt: new Date(), lastDeliveredAt: new Date() },
        { conversationId: conversation.id, userId: participantUserId },
      ],
    });

    return conversation;
  });
}

// ── Conversation listing ────────────────────────────────────────────────────

async function listConversations(userId) {
  await syncTeamConversations(userId).catch((err) => {
    console.error('Team conversation sync failed:', err);
  });

  const memberships = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: { conversation: true },
    orderBy: { conversation: { lastMessageAt: { sort: 'desc', nulls: 'last' } } },
  });

  const conversationIds = memberships.map((m) => m.conversationId);
  if (conversationIds.length === 0) return [];

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId: { in: conversationIds } },
    include: { user: { include: { profile: { select: { academicYear: true } } } } },
  });

  const latestMessages = await prisma.chatMessage.findMany({
    where: { conversationId: { in: conversationIds } },
    include: { sender: true },
    orderBy: { sentAt: 'desc' },
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
    const conversationParticipants = participantsByConversation[membership.conversationId] || [];
    const otherParticipantMembership = conversationParticipants
      .find((p) => p.userId !== userId);
    const lastMessage = messageMap[membership.conversationId];

    const unreadWhere = {
      conversationId: membership.conversationId,
      senderId: { not: userId },
    };
    if (membership.lastReadAt) {
      unreadWhere.sentAt = { gt: membership.lastReadAt };
    }
    const unreadCount = await prisma.chatMessage.count({ where: unreadWhere });

    const isTeam = membership.conversation.type === 'TEAM';

    const base = {
      id: membership.conversation.id,
      type: membership.conversation.type === 'TEAM' ? 'team' : 'dm',
      unreadCount,
      lastActivityAt: membership.conversation.lastMessageAt || membership.conversation.createdAt,
      lastMessage: lastMessage
        ? toMessagePayload(lastMessage, userId, otherParticipantMembership?.lastReadAt || null)
        : null,
    };

    if (isTeam) {
      return {
        ...base,
        name: membership.conversation.name,
        teamId: membership.conversation.teamId,
        participant: null,
        participants: conversationParticipants
          .filter((p) => p.userId !== userId)
          .map((p) => (p.user ? toUserSummary(p.user) : null))
          .filter(Boolean),
      };
    }

    return {
      ...base,
      participant: otherParticipantMembership?.user ? toUserSummary(otherParticipantMembership.user) : null,
      participants: [],
    };
  }));

  results.sort((a, b) => new Date(b.lastActivityAt || 0) - new Date(a.lastActivityAt || 0));
  return results;
}

// ── Messages ────────────────────────────────────────────────────────────────

async function listMessages(userId, conversationId, { cursor, limit = 30 }) {
  await requireConversationMembership(conversationId, userId);
  const parsedLimit = Number.parseInt(limit, 10);
  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 50)
    : 30;

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
  });
  const recipientReadAt = participants.find((p) => p.userId !== userId)?.lastReadAt || null;

  const where = { conversationId };
  if (cursor) {
    const parsedCursor = new Date(cursor);
    if (Number.isNaN(parsedCursor.getTime())) {
      const err = new Error('Invalid message cursor');
      err.status = 400;
      throw err;
    }
    where.sentAt = { lt: parsedCursor };
  }

  const messages = await prisma.chatMessage.findMany({
    where,
    include: {
      sender: true,
      reactions: true,
    },
    orderBy: { sentAt: 'desc' },
    take: safeLimit,
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
  if (!match) return null;

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
    ? (file.mimetype?.startsWith('image/') ? 'IMAGE' : 'FILE')
    : 'TEXT';

  const message = await prisma.chatMessage.create({
    data: {
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
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageId: message.id, lastMessageAt: sentAt },
  });

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: { not: senderId },
    },
    data: { lastDeliveredAt: sentAt },
  });

  return getMessageById(message.id, senderId);
}

async function getAttachmentForUser(userId, filename) {
  const attachmentUrl = `/api/messages/uploads/${filename}`;
  const message = await prisma.chatMessage.findFirst({
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
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      sender: true,
      reactions: true,
    },
  });

  if (!message) return null;

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId: message.conversationId },
  });
  const recipientReadAt = participants.find((p) => p.userId !== currentUserId)?.lastReadAt || null;
  return toMessagePayload(message, currentUserId, recipientReadAt);
}

// ── Read receipts & reactions ───────────────────────────────────────────────

async function markConversationRead(userId, conversationId) {
  await requireConversationMembership(conversationId, userId);
  const readAt = new Date();

  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: readAt },
  });

  return { conversationId, userId, readAt };
}

async function toggleReaction({ userId, messageId, emoji }) {
  const message = await prisma.chatMessage.findUnique({ where: { id: messageId } });
  if (!message) {
    const err = new Error('Message not found');
    err.status = 404;
    throw err;
  }

  await requireConversationMembership(message.conversationId, userId);

  const existing = await prisma.messageReaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId, emoji } },
  });

  if (existing) {
    await prisma.messageReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.messageReaction.create({ data: { messageId, userId, emoji } });
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
