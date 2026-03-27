import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import chatService from '../services/chatService';
import {
  fetchConversations,
  fetchMessages,
  markConversationRead,
  openDmConversation,
  sendMessage as sendMessageRequest,
  toggleMessageReaction,
} from '../services/chatApi';
import { getAuthToken, mapAuthUser } from '../services/authAdapter';

const ChatContext = createContext(null);

function mergeMessageLists(existing, incoming) {
  const byKey = new Map();
  [...existing, ...incoming].forEach((message) => {
    const key = message.id || message.clientMessageId;
    if (!key) {
      return;
    }
    byKey.set(key, { ...(byKey.get(key) || {}), ...message });
  });

  return [...byKey.values()].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
}

function replaceConversation(conversations, nextConversation) {
  const existing = conversations.find((conversation) => conversation.id === nextConversation.id);
  if (!existing) {
    return [nextConversation, ...conversations];
  }

  const updated = conversations.map((conversation) => (
    conversation.id === nextConversation.id ? { ...conversation, ...nextConversation } : conversation
  ));

  return updated.sort((a, b) => new Date(b.lastActivityAt || 0) - new Date(a.lastActivityAt || 0));
}

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const currentUser = useMemo(() => mapAuthUser(user), [user]);
  const canUseChat = Boolean(isAuthenticated && currentUser?.id);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [typingUsersByConversation, setTypingUsersByConversation] = useState({});
  const [presenceByUserId, setPresenceByUserId] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [hasMoreByConversation, setHasMoreByConversation] = useState({});
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessagesByConversation, setLoadingMessagesByConversation] = useState({});
  const [sendingByConversation, setSendingByConversation] = useState({});
  const [errorByConversation, setErrorByConversation] = useState({});
  const nextCursorByConversation = useRef({});
  const activeConversationRef = useRef(null);
  const typingTimeouts = useRef({});
  const optimisticAttachmentUrls = useRef(new Set());

  const hydratePresence = useCallback((nextConversations) => {
    setPresenceByUserId((current) => {
      const merged = { ...current };
      nextConversations.forEach((conversation) => {
        if (conversation.participant?.id && typeof merged[conversation.participant.id] === 'undefined') {
          merged[conversation.participant.id] = false;
        }
      });
      return merged;
    });
  }, []);

  const loadConversations = useCallback(async () => {
    if (!canUseChat) {
      setConversations([]);
      setActiveConversationId(null);
      return;
    }

    setLoadingConversations(true);
    try {
      const nextConversations = await fetchConversations();
      setConversations(nextConversations);
      hydratePresence(nextConversations);
      setActiveConversationId((current) => current || nextConversations[0]?.id || null);
    } catch {
      // Ignore network/auth errors here; consumer UIs can rely on loading and empty states.
    } finally {
      setLoadingConversations(false);
    }
  }, [canUseChat, hydratePresence]);

  const loadConversationMessages = useCallback(async (conversationId, { append = false } = {}) => {
    if (!conversationId || !canUseChat) {
      return;
    }

    setLoadingMessagesByConversation((current) => ({ ...current, [conversationId]: true }));
    try {
      const payload = await fetchMessages(conversationId, append ? nextCursorByConversation.current[conversationId] : undefined);
      nextCursorByConversation.current[conversationId] = payload.nextCursor;
      setHasMoreByConversation((current) => ({ ...current, [conversationId]: Boolean(payload.nextCursor) }));
      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: append
          ? mergeMessageLists(payload.messages, current[conversationId] || [])
          : mergeMessageLists([], payload.messages),
      }));
    } finally {
      setLoadingMessagesByConversation((current) => ({ ...current, [conversationId]: false }));
    }
  }, [canUseChat]);

  useEffect(() => {
    if (loading || !canUseChat) {
      setConversations([]);
      setActiveConversationId(null);
      setMessagesByConversation({});
      setTypingUsersByConversation({});
      setPresenceByUserId({});
      setConnectionStatus('disconnected');
      chatService.disconnect();
      return undefined;
    }

    let mounted = true;

    async function boot() {
      const token = await getAuthToken();
      if (!mounted || !token) {
        return;
      }

      chatService.connect(token);
      try {
        await loadConversations();
      } catch {
        // Keep provider mounted even if backend is temporarily unavailable.
      }
    }

    boot();

    const onStatus = (status) => setConnectionStatus(status);
    const onNewMessage = ({ conversationId, message }) => {
      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: mergeMessageLists(current[conversationId] || [], [message]),
      }));
      setConversations((current) => replaceConversation(current, {
        id: conversationId,
        lastMessage: message,
        lastActivityAt: message.sentAt,
      }));
    };
    const onRead = ({ conversationId, userId, readAt }) => {
      if (userId === currentUser.id) {
        setConversations((current) => current.map((conversation) => (
          conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
        )));
      }

      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: (current[conversationId] || []).map((message) => (
          message.senderId === currentUser.id && new Date(message.sentAt) <= new Date(readAt)
            ? { ...message, read: true }
            : message
        )),
      }));
    };
    const onTyping = ({ conversationId, userId, isTyping }) => {
      setTypingUsersByConversation((current) => {
        const existing = current[conversationId] || [];
        const nextUsers = isTyping
          ? [...new Set([...existing, userId])]
          : existing.filter((candidate) => candidate !== userId);
        return { ...current, [conversationId]: nextUsers };
      });

      if (isTyping) {
        clearTimeout(typingTimeouts.current[`${conversationId}:${userId}`]);
        typingTimeouts.current[`${conversationId}:${userId}`] = setTimeout(() => {
          setTypingUsersByConversation((current) => ({
            ...current,
            [conversationId]: (current[conversationId] || []).filter((candidate) => candidate !== userId),
          }));
        }, 3200);
      }
    };
    const onReaction = ({ conversationId, message }) => {
      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: (current[conversationId] || []).map((entry) => (
          entry.id === message.id ? message : entry
        )),
      }));
    };
    const onPresence = ({ userId, isOnline }) => {
      setPresenceByUserId((current) => ({ ...current, [userId]: isOnline }));
    };
    const onConversationUpdated = ({ conversation, conversationId }) => {
      if (conversation) {
        setConversations((current) => replaceConversation(current, conversation));
        return;
      }

      if (conversationId) {
        loadConversations().catch(() => {});
      }
    };

    chatService.on('connection-status', onStatus);
    chatService.on('message:new', onNewMessage);
    chatService.on('message:read', onRead);
    chatService.on('typing:update', onTyping);
    chatService.on('reaction:update', onReaction);
    chatService.on('presence:update', onPresence);
    chatService.on('conversation:updated', onConversationUpdated);
    const attachmentUrls = optimisticAttachmentUrls.current;

    return () => {
      mounted = false;
      chatService.off('connection-status', onStatus);
      chatService.off('message:new', onNewMessage);
      chatService.off('message:read', onRead);
      chatService.off('typing:update', onTyping);
      chatService.off('reaction:update', onReaction);
      chatService.off('presence:update', onPresence);
      chatService.off('conversation:updated', onConversationUpdated);
      chatService.disconnect();
      attachmentUrls.forEach((url) => URL.revokeObjectURL(url));
      attachmentUrls.clear();
    };
  }, [canUseChat, currentUser, loadConversations, loading]);

  useEffect(() => {
    if (!canUseChat) {
      return;
    }

    if (!activeConversationId || activeConversationRef.current === activeConversationId) {
      return;
    }

    if (activeConversationRef.current) {
      chatService.leaveConversation(activeConversationRef.current);
    }

    activeConversationRef.current = activeConversationId;
    chatService.joinConversation(activeConversationId);
    loadConversationMessages(activeConversationId);
    markConversationRead(activeConversationId).catch(() => {});
    chatService.markRead(activeConversationId);
  }, [activeConversationId, canUseChat, loadConversationMessages]);

  useEffect(() => {
    if (!chatService.socket) {
      return undefined;
    }

    const interval = setInterval(() => chatService.heartbeat(), 15000);
    return () => clearInterval(interval);
  }, [connectionStatus]);

  const openOrCreateDM = useCallback(async (participantOrId) => {
    const participantUserId = typeof participantOrId === 'string'
      ? participantOrId
      : participantOrId.id;

    const conversation = await openDmConversation(participantUserId);
    setConversations((current) => replaceConversation(current, conversation));
    setActiveConversationId(conversation.id);
    return conversation;
  }, []);

  const setActiveConversation = useCallback(async (conversationId) => {
    setActiveConversationId(conversationId);
    setConversations((current) => current.map((conversation) => (
      conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
    )));
  }, []);

  const sendMessage = useCallback(async (conversationId, payload) => {
    const clientMessageId = `local-${Date.now()}`;
    const optimisticAttachmentUrl = payload.file ? URL.createObjectURL(payload.file) : null;
    if (optimisticAttachmentUrl) {
      optimisticAttachmentUrls.current.add(optimisticAttachmentUrl);
    }
    const optimisticMessage = {
      id: clientMessageId,
      clientMessageId,
      senderId: currentUser.id,
      sender: currentUser,
      body: payload.body,
      messageType: payload.file ? (payload.file.type.startsWith('image/') ? 'image' : 'file') : 'text',
      attachmentName: payload.file?.name || null,
      attachmentMimeType: payload.file?.type || null,
      attachmentSize: payload.file?.size || null,
      attachmentUrl: optimisticAttachmentUrl,
      linkPreview: null,
      reactions: [],
      sentAt: new Date().toISOString(),
      read: false,
      isPending: true,
    };

    setMessagesByConversation((current) => ({
      ...current,
      [conversationId]: mergeMessageLists(current[conversationId] || [], [optimisticMessage]),
    }));
    setSendingByConversation((current) => ({ ...current, [conversationId]: true }));
    setErrorByConversation((current) => ({ ...current, [conversationId]: null }));

    try {
      const persisted = await sendMessageRequest(conversationId, {
        body: payload.body,
        file: payload.file,
        clientMessageId,
      });
      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: mergeMessageLists(
          (current[conversationId] || []).filter((message) => message.clientMessageId !== clientMessageId),
          [persisted]
        ),
      }));
      setConversations((current) => replaceConversation(current, {
        id: conversationId,
        lastMessage: persisted,
        lastActivityAt: persisted.sentAt,
      }));
      if (optimisticAttachmentUrl) {
        URL.revokeObjectURL(optimisticAttachmentUrl);
        optimisticAttachmentUrls.current.delete(optimisticAttachmentUrl);
      }
    } catch (error) {
      setMessagesByConversation((current) => ({
        ...current,
        [conversationId]: (current[conversationId] || []).map((message) => (
          message.clientMessageId === clientMessageId ? { ...message, isFailed: true, isPending: false } : message
        )),
      }));
      setErrorByConversation((current) => ({
        ...current,
        [conversationId]: error?.response?.data?.error?.message || error.message || 'Failed to send message',
      }));
      throw error;
    } finally {
      setSendingByConversation((current) => ({ ...current, [conversationId]: false }));
      chatService.stopTyping(conversationId);
    }
  }, [currentUser]);

  const emitTyping = useCallback((conversationId, isTyping) => {
    if (isTyping) {
      chatService.startTyping(conversationId);
    } else {
      chatService.stopTyping(conversationId);
    }
  }, []);

  const loadOlderMessages = useCallback(async (conversationId) => {
    if (!hasMoreByConversation[conversationId]) {
      return;
    }
    await loadConversationMessages(conversationId, { append: true });
  }, [hasMoreByConversation, loadConversationMessages]);

  const markRead = useCallback(async (conversationId) => {
    await markConversationRead(conversationId);
    chatService.markRead(conversationId);
  }, []);

  const toggleReaction = useCallback(async (messageId, emoji) => {
    await toggleMessageReaction(messageId, emoji);
    chatService.toggleReaction(messageId, emoji);
  }, []);

  const hydratedConversations = useMemo(() => conversations.map((conversation) => ({
    ...conversation,
    participant: conversation.participant
      ? {
          ...conversation.participant,
          online: presenceByUserId[conversation.participant.id] || false,
          gradient: conversation.participant.accentColor || conversation.participant.gradient,
        }
      : null,
  })), [conversations, presenceByUserId]);

  const totalUnread = hydratedConversations.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        conversations: hydratedConversations,
        activeConversationId,
        messages: messagesByConversation,
        typingUsers: typingUsersByConversation,
        presenceByUserId,
        connectionStatus,
        hasMoreByConversation,
        loadingConversations,
        loadingMessagesByConversation,
        sendingByConversation,
        errorByConversation,
        totalUnread,
        openOrCreateDM,
        setActiveConversation,
        sendMessage,
        emitTyping,
        loadOlderMessages,
        markConversationRead: markRead,
        toggleReaction,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
