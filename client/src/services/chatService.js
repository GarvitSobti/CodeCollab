import { io } from 'socket.io-client';
import { getSocketOrigin, isRealtimeEnabled } from '../utils/runtimeConfig';

const SOCKET_URL = getSocketOrigin();

class ChatService {
  constructor() {
    this.socket = null;
    this.handlers = {};
    this.activeConversationId = null;
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    if (!isRealtimeEnabled()) {
      this._emit('connection-status', 'disconnected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this._emit('connection-status', 'connected');
      if (this.activeConversationId) {
        this.joinConversation(this.activeConversationId);
      }
    });

    this.socket.on('disconnect', () => {
      this._emit('connection-status', 'disconnected');
    });

    this.socket.on('connect_error', () => {
      this._emit('connection-status', 'disconnected');
    });

    this.socket.on('message:new', (payload) => this._emit('message:new', payload));
    this.socket.on('message:read', (payload) => this._emit('message:read', payload));
    this.socket.on('typing:update', (payload) => this._emit('typing:update', payload));
    this.socket.on('reaction:update', (payload) => this._emit('reaction:update', payload));
    this.socket.on('presence:update', (payload) => this._emit('presence:update', payload));
    this.socket.on('conversation:updated', (payload) => this._emit('conversation:updated', payload));
    this.socket.on('chat:error', (payload) => this._emit('chat:error', payload));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.activeConversationId = null;
  }

  joinConversation(conversationId) {
    this.activeConversationId = conversationId;
    this.socket?.emit('conversation:join', { conversationId });
  }

  leaveConversation(conversationId) {
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
    }
    this.socket?.emit('conversation:leave', { conversationId });
  }

  startTyping(conversationId) {
    this.socket?.emit('typing:start', { conversationId });
  }

  stopTyping(conversationId) {
    this.socket?.emit('typing:stop', { conversationId });
  }

  markRead(conversationId) {
    this.socket?.emit('message:read', { conversationId });
  }

  toggleReaction(messageId, emoji) {
    this.socket?.emit('reaction:toggle', { messageId, emoji });
  }

  heartbeat() {
    this.socket?.emit('presence:heartbeat');
  }

  on(event, handler) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  off(event, handler) {
    if (!this.handlers[event]) {
      return;
    }
    this.handlers[event] = this.handlers[event].filter((candidate) => candidate !== handler);
  }

  _emit(event, payload) {
    (this.handlers[event] || []).forEach((handler) => handler(payload));
  }
}

const chatService = new ChatService();
export default chatService;
