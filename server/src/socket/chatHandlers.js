/**
 * Socket.io chat event handlers.
 * Uses an in-memory store for demo purposes — swap with DB calls in production.
 */

// In-memory stores
const messageStore = {};   // { roomId: Message[] }
const presenceMap = {};    // { userId: socketId }
const socketUserMap = {};  // { socketId: userId }
const socketRooms = {};    // { socketId: Set<roomId> }

function getOrCreateRoom(roomId) {
  if (!messageStore[roomId]) messageStore[roomId] = [];
  return messageStore[roomId];
}

function registerChatHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[chat] client connected: ${socket.id}`);

    // ── User comes online ──────────────────────────────────────────────────
    socket.on('user-online', ({ userId }) => {
      presenceMap[userId] = socket.id;
      socketUserMap[socket.id] = userId;
      socketRooms[socket.id] = new Set();
      // Broadcast to all clients
      socket.broadcast.emit('user-online', { userId });
      console.log(`[chat] ${userId} is online`);
    });

    // ── Join a room ────────────────────────────────────────────────────────
    socket.on('join-room', ({ roomId, userId }) => {
      socket.join(roomId);
      if (socketRooms[socket.id]) socketRooms[socket.id].add(roomId);
      console.log(`[chat] ${userId || socket.id} joined room ${roomId}`);
    });

    // ── Leave a room ───────────────────────────────────────────────────────
    socket.on('leave-room', ({ roomId, userId }) => {
      socket.leave(roomId);
      if (socketRooms[socket.id]) socketRooms[socket.id].delete(roomId);
      console.log(`[chat] ${userId || socket.id} left room ${roomId}`);
    });

    // ── Send a message ─────────────────────────────────────────────────────
    socket.on('send-message', ({ roomId, message, userId }) => {
      if (!roomId || !message?.text) return;

      const stored = {
        id: message.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text: message.text,
        senderId: userId || message.senderId || 'unknown',
        time: message.time || new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        timestamp: Date.now(),
      };

      getOrCreateRoom(roomId).push(stored);

      // Emit to everyone in the room (including sender's other tabs)
      io.to(roomId).emit('new-message', { roomId, message: stored });
      console.log(`[chat] message in room ${roomId} from ${stored.senderId}`);
    });

    // ── Typing indicator ──────────────────────────────────────────────────
    socket.on('typing', ({ roomId, userId, isTyping }) => {
      if (!roomId || !userId) return;
      // Broadcast to room excluding sender
      socket.to(roomId).emit('user-typing', { roomId, userId, isTyping });
    });

    // ── Mark messages as read ─────────────────────────────────────────────
    socket.on('mark-read', ({ roomId, userId }) => {
      if (!roomId || !userId) return;
      const room = messageStore[roomId];
      if (room) {
        room.forEach(m => { if (m.senderId !== userId) m.read = true; });
      }
      socket.to(roomId).emit('messages-read', { roomId, userId });
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const userId = socketUserMap[socket.id];
      if (userId) {
        delete presenceMap[userId];
        socket.broadcast.emit('user-offline', { userId });
        console.log(`[chat] ${userId} went offline`);
      }
      delete socketUserMap[socket.id];
      delete socketRooms[socket.id];
    });
  });
}

// Expose message store for REST routes
function getMessages(roomId) {
  return messageStore[roomId] || [];
}

function addMessage(roomId, message) {
  const room = getOrCreateRoom(roomId);
  room.push(message);
  return message;
}

module.exports = { registerChatHandlers, getMessages, addMessage };
