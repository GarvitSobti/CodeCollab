const {
  createMessage,
  ensureCurrentUser,
  markConversationRead,
  requireConversationMembership,
  toggleReaction,
} = require('../services/chatService');
const { verifySocketUser } = require('../utils/socketAuth');

const typingTimers = new Map();
const presenceSockets = new Map();

function emitPresence(io, userId, isOnline) {
  io.emit('presence:update', { userId, isOnline });
}

async function registerChatHandlers(io) {
  io.use(async (socket, next) => {
    try {
      socket.user = await verifySocketUser(socket);
      await ensureCurrentUser(socket.user);
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.uid;
    const currentCount = presenceSockets.get(userId) || 0;
    presenceSockets.set(userId, currentCount + 1);
    emitPresence(io, userId, true);

    socket.on('conversation:join', async ({ conversationId }) => {
      try {
        await requireConversationMembership(conversationId, userId);
        socket.join(conversationId);
      } catch (error) {
        socket.emit('chat:error', { message: error.message, conversationId });
      }
    });

    socket.on('conversation:leave', ({ conversationId }) => {
      socket.leave(conversationId);
    });

    socket.on('message:send', async (payload) => {
      try {
        const message = await createMessage({
          conversationId: payload.conversationId,
          senderId: userId,
          body: payload.body,
          clientMessageId: payload.clientMessageId,
          file: null,
        });

        io.to(payload.conversationId).emit('message:new', {
          conversationId: payload.conversationId,
          message,
        });
        io.to(payload.conversationId).emit('conversation:updated', {
          conversationId: payload.conversationId,
        });
      } catch (error) {
        socket.emit('chat:error', { message: error.message, conversationId: payload.conversationId });
      }
    });

    socket.on('message:read', async ({ conversationId }) => {
      try {
        const payload = await markConversationRead(userId, conversationId);
        io.to(conversationId).emit('message:read', payload);
      } catch (error) {
        socket.emit('chat:error', { message: error.message, conversationId });
      }
    });

    socket.on('typing:start', async ({ conversationId }) => {
      try {
        await requireConversationMembership(conversationId, userId);
        socket.to(conversationId).emit('typing:update', { conversationId, userId, isTyping: true });
        const timerKey = `${conversationId}:${userId}`;
        clearTimeout(typingTimers.get(timerKey));
        typingTimers.set(timerKey, setTimeout(() => {
          socket.to(conversationId).emit('typing:update', { conversationId, userId, isTyping: false });
          typingTimers.delete(timerKey);
        }, 3000));
      } catch (error) {
        socket.emit('chat:error', { message: error.message, conversationId });
      }
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:update', { conversationId, userId, isTyping: false });
      const timerKey = `${conversationId}:${userId}`;
      clearTimeout(typingTimers.get(timerKey));
      typingTimers.delete(timerKey);
    });

    socket.on('reaction:toggle', async ({ messageId, emoji }) => {
      try {
        const payload = await toggleReaction({ userId, messageId, emoji });
        io.to(payload.conversationId).emit('reaction:update', payload);
      } catch (error) {
        socket.emit('chat:error', { message: error.message, messageId });
      }
    });

    socket.on('presence:heartbeat', () => {
      emitPresence(io, userId, true);
    });

    socket.on('disconnect', () => {
      const nextCount = Math.max((presenceSockets.get(userId) || 1) - 1, 0);
      if (nextCount === 0) {
        presenceSockets.delete(userId);
        emitPresence(io, userId, false);
      } else {
        presenceSockets.set(userId, nextCount);
      }
    });
  });
}

module.exports = { registerChatHandlers };
