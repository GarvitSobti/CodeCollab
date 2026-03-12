import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react';
import chatService from '../services/chatService';

const ChatContext = createContext();

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
};

// ─── Mock data ───────────────────────────────────────────────────────────────
const CURRENT_USER = {
  id: 'me',
  name: 'You',
  initials: 'YO',
  gradient: 'linear-gradient(135deg, var(--peach), var(--coral))',
};

const MOCK_CONVERSATIONS = [
  {
    id: 'dm-jamie',
    type: 'dm',
    participant: { id: 'jamie', name: 'Jamie Tan', initials: 'JT', gradient: 'linear-gradient(135deg,#ff6b6b,#ff8a65)', online: true },
    lastMessage: "Let's sync up before the hackathon!",
    lastTime: '2m',
    unread: 3,
  },
  {
    id: 'dm-weiming',
    type: 'dm',
    participant: { id: 'weiming', name: 'Wei Ming Chen', initials: 'WM', gradient: 'linear-gradient(135deg,#42a5f5,#1e88e5)', online: true },
    lastMessage: 'ML model is looking great!',
    lastTime: '1h',
    unread: 0,
  },
  {
    id: 'dm-priya',
    type: 'dm',
    participant: { id: 'priya', name: 'Priya Sharma', initials: 'PS', gradient: 'linear-gradient(135deg,#b39ddb,#7e57c2)', online: false },
    lastMessage: 'Database schema is ready',
    lastTime: '3h',
    unread: 1,
  },
  {
    id: 'dm-alex',
    type: 'dm',
    participant: { id: 'alex', name: 'Alex Ng', initials: 'AN', gradient: 'linear-gradient(135deg,#66bb6a,#43a047)', online: false },
    lastMessage: "I'll have the mobile build ready by tonight",
    lastTime: '5h',
    unread: 0,
  },
];

const MOCK_MESSAGES = {
  'dm-jamie': [
    { id: '1', text: 'Hey! Did you see the new problem statement?', senderId: 'jamie', time: '10:02', read: true },
    { id: '2', text: 'Just saw it. The AI track looks really interesting', senderId: 'me', time: '10:04', read: true },
    { id: '3', text: 'Yeah! I was thinking we could build something with LLMs', senderId: 'jamie', time: '10:05', read: true },
    { id: '4', text: "That's exactly what I had in mind. Let's do it 🚀", senderId: 'me', time: '10:06', read: true },
    { id: '5', text: "Let's sync up before the hackathon!", senderId: 'jamie', time: '10:08', read: false },
  ],
  'dm-weiming': [
    { id: '1', text: 'Just finished training the matching model', senderId: 'weiming', time: '09:12', read: true },
    { id: '2', text: 'How is the accuracy?', senderId: 'me', time: '09:15', read: true },
    { id: '3', text: 'ML model is looking great!', senderId: 'weiming', time: '09:16', read: true },
  ],
  'dm-priya': [
    { id: '1', text: 'I finished the migrations', senderId: 'priya', time: '07:30', read: true },
    { id: '2', text: 'Database schema is ready', senderId: 'priya', time: '07:31', read: false },
  ],
  'dm-alex': [
    { id: '1', text: "I'll have the mobile build ready by tonight", senderId: 'alex', time: '05:00', read: true },
  ],
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const initialState = {
  conversations: MOCK_CONVERSATIONS,
  activeConversationId: 'dm-jamie',
  messages: MOCK_MESSAGES,
  typingUsers: {},   // { conversationId: [userId, ...] }
  connectionStatus: 'disconnected',
  onlineUsers: new Set(),
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };

    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };

    case 'ADD_MESSAGE': {
      const { convId, message } = action.payload;
      const prev = state.messages[convId] || [];
      const updated = [...prev, message];
      // Update last message preview in conversations list
      const conversations = state.conversations.map(c =>
        c.id === convId
          ? { ...c, lastMessage: message.text, lastTime: 'now' }
          : c
      );
      return {
        ...state,
        messages: { ...state.messages, [convId]: updated },
        conversations,
      };
    }

    case 'MARK_READ': {
      const { convId } = action.payload;
      const msgs = (state.messages[convId] || []).map(m => ({ ...m, read: true }));
      const conversations = state.conversations.map(c =>
        c.id === convId ? { ...c, unread: 0 } : c
      );
      return {
        ...state,
        messages: { ...state.messages, [convId]: msgs },
        conversations,
      };
    }

    case 'SET_TYPING': {
      const { convId, userId, isTyping } = action.payload;
      const current = state.typingUsers[convId] || [];
      const updated = isTyping
        ? [...new Set([...current, userId])]
        : current.filter(id => id !== userId);
      return {
        ...state,
        typingUsers: { ...state.typingUsers, [convId]: updated },
      };
    }

    case 'SET_USER_ONLINE': {
      const next = new Set(state.onlineUsers);
      next.add(action.payload);
      const conversations = state.conversations.map(c =>
        c.participant?.id === action.payload ? { ...c, participant: { ...c.participant, online: true } } : c
      );
      return { ...state, onlineUsers: next, conversations };
    }

    case 'SET_USER_OFFLINE': {
      const next = new Set(state.onlineUsers);
      next.delete(action.payload);
      const conversations = state.conversations.map(c =>
        c.participant?.id === action.payload ? { ...c, participant: { ...c.participant, online: false } } : c
      );
      return { ...state, onlineUsers: next, conversations };
    }

    case 'ADD_CONVERSATION': {
      const exists = state.conversations.find(c => c.id === action.payload.id);
      if (exists) return { ...state, activeConversationId: action.payload.id };
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        messages: { ...state.messages, [action.payload.id]: [] },
        activeConversationId: action.payload.id,
      };
    }

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const typingTimers = useRef({});

  // Connect to socket on mount
  useEffect(() => {
    chatService.connect(CURRENT_USER.id);

    const onStatus = status => dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
    const onMessage = ({ roomId, message }) => {
      dispatch({ type: 'ADD_MESSAGE', payload: { convId: roomId, message } });
    };
    const onTyping = ({ roomId, userId, isTyping }) => {
      dispatch({ type: 'SET_TYPING', payload: { convId: roomId, userId, isTyping } });
      // Auto-clear typing after 3s
      if (isTyping) {
        clearTimeout(typingTimers.current[`${roomId}-${userId}`]);
        typingTimers.current[`${roomId}-${userId}`] = setTimeout(() => {
          dispatch({ type: 'SET_TYPING', payload: { convId: roomId, userId, isTyping: false } });
        }, 3000);
      }
    };
    const onOnline = ({ userId }) => dispatch({ type: 'SET_USER_ONLINE', payload: userId });
    const onOffline = ({ userId }) => dispatch({ type: 'SET_USER_OFFLINE', payload: userId });

    chatService.on('connection-status', onStatus);
    chatService.on('new-message', onMessage);
    chatService.on('user-typing', onTyping);
    chatService.on('user-online', onOnline);
    chatService.on('user-offline', onOffline);

    return () => {
      chatService.off('connection-status', onStatus);
      chatService.off('new-message', onMessage);
      chatService.off('user-typing', onTyping);
      chatService.off('user-online', onOnline);
      chatService.off('user-offline', onOffline);
      chatService.disconnect();
    };
  }, []);

  // Join socket room when active conversation changes
  useEffect(() => {
    if (state.activeConversationId) {
      chatService.joinRoom(state.activeConversationId);
    }
  }, [state.activeConversationId]);

  const setActiveConversation = useCallback((convId) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: convId });
    dispatch({ type: 'MARK_READ', payload: { convId } });
    chatService.markRead(convId);
  }, []);

  const sendMessage = useCallback((convId, text) => {
    if (!text.trim()) return;
    const message = {
      id: `local-${Date.now()}`,
      text: text.trim(),
      senderId: CURRENT_USER.id,
      time: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    // Optimistic update
    dispatch({ type: 'ADD_MESSAGE', payload: { convId, message } });
    // Emit to socket (may fail if offline — that's OK, message is local)
    chatService.sendMessage(convId, message);
  }, []);

  const emitTyping = useCallback((convId, isTyping) => {
    chatService.emitTyping(convId, isTyping);
  }, []);

  const openOrCreateDM = useCallback((participant) => {
    const convId = `dm-${participant.id}`;
    dispatch({
      type: 'ADD_CONVERSATION',
      payload: {
        id: convId,
        type: 'dm',
        participant,
        lastMessage: '',
        lastTime: 'now',
        unread: 0,
      },
    });
  }, []);

  const totalUnread = state.conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        currentUser: CURRENT_USER,
        totalUnread,
        setActiveConversation,
        sendMessage,
        emitTyping,
        openOrCreateDM,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
