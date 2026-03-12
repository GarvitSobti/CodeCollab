import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class ChatService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.handlers = {};
  }

  connect(userId) {
    if (this.socket?.connected) return;

    this.userId = userId;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this._emit('connection-status', 'connected');
      if (userId) {
        this.socket.emit('user-online', { userId });
      }
    });

    this.socket.on('disconnect', () => {
      this._emit('connection-status', 'disconnected');
    });

    this.socket.on('connect_error', () => {
      this._emit('connection-status', 'disconnected');
    });

    this.socket.on('reconnecting', () => {
      this._emit('connection-status', 'connecting');
    });

    this.socket.on('new-message', (data) => {
      this._emit('new-message', data);
    });

    this.socket.on('user-typing', (data) => {
      this._emit('user-typing', data);
    });

    this.socket.on('messages-read', (data) => {
      this._emit('messages-read', data);
    });

    this.socket.on('user-online', (data) => {
      this._emit('user-online', data);
    });

    this.socket.on('user-offline', (data) => {
      this._emit('user-offline', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId) {
    if (!this.socket) return;
    this.socket.emit('join-room', { roomId, userId: this.userId });
  }

  leaveRoom(roomId) {
    if (!this.socket) return;
    this.socket.emit('leave-room', { roomId, userId: this.userId });
  }

  sendMessage(roomId, message) {
    if (!this.socket?.connected) return false;
    this.socket.emit('send-message', { roomId, message, userId: this.userId });
    return true;
  }

  emitTyping(roomId, isTyping) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing', { roomId, userId: this.userId, isTyping });
  }

  markRead(roomId) {
    if (!this.socket?.connected) return;
    this.socket.emit('mark-read', { roomId, userId: this.userId });
  }

  on(event, handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  off(event, handler) {
    if (!this.handlers[event]) return;
    this.handlers[event] = this.handlers[event].filter(h => h !== handler);
  }

  _emit(event, data) {
    if (!this.handlers[event]) return;
    this.handlers[event].forEach(h => h(data));
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

const chatService = new ChatService();
export default chatService;
