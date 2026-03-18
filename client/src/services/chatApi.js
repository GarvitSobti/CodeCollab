import api from './api';

export async function fetchConversations() {
  const response = await api.get('/api/messages/conversations');
  return response.data.conversations;
}

export async function openDmConversation(participantUserId) {
  const response = await api.post('/api/messages/conversations/dm/open', { participantUserId });
  return response.data.conversation;
}

export async function fetchMessages(conversationId, cursor) {
  const response = await api.get(`/api/messages/conversations/${conversationId}/messages`, {
    params: {
      cursor,
      limit: 30,
    },
  });

  return response.data;
}

export async function sendMessage(conversationId, payload) {
  const formData = new FormData();
  if (payload.body) {
    formData.append('body', payload.body);
  }
  if (payload.clientMessageId) {
    formData.append('clientMessageId', payload.clientMessageId);
  }
  if (payload.file) {
    formData.append('attachment', payload.file);
  }

  const response = await api.post(`/api/messages/conversations/${conversationId}/messages`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.message;
}

export async function markConversationRead(conversationId) {
  const response = await api.post(`/api/messages/conversations/${conversationId}/read`);
  return response.data;
}

export async function toggleMessageReaction(messageId, emoji) {
  const response = await api.post(`/api/messages/messages/${messageId}/reactions`, { emoji });
  return response.data;
}
