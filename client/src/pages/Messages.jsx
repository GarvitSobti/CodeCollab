import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from '../components/Navigation';
import ChatComponent from '../components/chat/ChatComponent';
import { useChatContext } from '../contexts/ChatContext';

function formatRelativeTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  return date.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
}

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const {
    conversations,
    activeConversationId,
    messages,
    typingUsers,
    connectionStatus,
    currentUser,
    hasMoreByConversation,
    loadingConversations,
    loadingMessagesByConversation,
    sendingByConversation,
    errorByConversation,
    setActiveConversation,
    sendMessage,
    emitTyping,
    openOrCreateDM,
    loadOlderMessages,
    toggleReaction,
  } = useChatContext();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!userId) {
      return;
    }

    openOrCreateDM(userId)
      .then((conversation) => {
        setActiveConversation(conversation.id);
        navigate('/messages', { replace: true });
      })
      .catch(() => {});
  }, [navigate, openOrCreateDM, setActiveConversation, userId]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [activeConversationId, conversations]
  );

  const activeMessages = messages[activeConversationId] || [];
  const activeTyping = typingUsers[activeConversationId] || [];

  const filteredConversations = conversations.filter((conversation) => {
    const q = search.toLowerCase();
    if (conversation.type === 'team') {
      return (conversation.name || '').toLowerCase().includes(q);
    }
    const participantName = conversation.participant?.name ?? '';
    return participantName.toLowerCase().includes(q);
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8 }}>
            Messages
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>
            Talk to potential teammates before you lock in a team.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, minHeight: 600, height: 'calc(100vh - 240px)' }}>
          {/* Conversation list */}
          <div style={{
            borderRadius: 'var(--radius)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations..."
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: 12,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    fontFamily: 'inherit',
                    fontSize: '0.78rem',
                    color: 'var(--text-dark)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingConversations ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-soft)' }}>Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-soft)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>💬</div>
                  <p style={{ fontSize: '0.8rem' }}>No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const isActive = conversation.id === activeConversationId;
                  const isTeam = conversation.type === 'team';
                  const participant = conversation.participant || {};

                  const teamInitials = isTeam
                    ? (conversation.name || 'T').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                    : null;

                  const typingList = typingUsers[conversation.id] || [];
                  let lastMessageLabel;
                  if (typingList.length > 0) {
                    lastMessageLabel = 'typing...';
                  } else if (conversation.lastMessage?.attachmentName) {
                    lastMessageLabel = `📎 ${conversation.lastMessage.attachmentName}`;
                  } else if (conversation.lastMessage?.body) {
                    const senderPrefix = isTeam && conversation.lastMessage.sender && !conversation.lastMessage.isOwnMessage
                      ? `${conversation.lastMessage.sender.name?.split(' ')[0]}: `
                      : '';
                    lastMessageLabel = `${senderPrefix}${conversation.lastMessage.body}`;
                  } else {
                    lastMessageLabel = 'No messages yet';
                  }

                  const displayName = isTeam ? (conversation.name || 'Team Chat') : (participant.name || 'Unknown');
                  const avatarGradient = isTeam
                    ? 'linear-gradient(135deg,#667eea,#764ba2)'
                    : (participant.gradient || 'linear-gradient(135deg,#ff8a65,#ff6b6b)');
                  const avatarInitials = isTeam ? teamInitials : (participant.initials || '?');
                  const memberCount = isTeam ? (conversation.participants || []).length + 1 : 0;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setActiveConversation(conversation.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        cursor: 'pointer',
                        borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                        background: isActive ? 'rgba(224,93,80,0.04)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: isTeam ? 12 : 13,
                          background: avatarGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          color: 'white',
                        }}>
                          {avatarInitials}
                        </div>
                        {isTeam ? (
                          <div style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: 'var(--bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          </div>
                        ) : (
                          <div style={{
                            position: 'absolute',
                            bottom: -1,
                            right: -1,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: participant.online ? '#5a9a5e' : 'var(--text-faint)',
                            border: '2px solid var(--bg-card)',
                          }} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0, flex: 1 }}>
                            <h4 style={{ fontSize: '0.84rem', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</h4>
                            {isTeam && (
                              <span style={{ fontSize: '0.58rem', color: 'var(--text-faint)', flexShrink: 0 }}>{memberCount}</span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)', flexShrink: 0, marginLeft: 6 }}>{formatRelativeTime(conversation.lastActivityAt)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{
                            fontSize: '0.71rem',
                            color: 'var(--text-soft)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flex: 1,
                            minWidth: 0,
                            margin: 0,
                          }}>
                            {lastMessageLabel}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <div style={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              marginLeft: 6,
                              flexShrink: 0,
                              background: 'var(--accent)',
                              color: 'white',
                              fontSize: '0.55rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {activeConversation && currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <ChatComponent
                chatType={activeConversation.type || 'dm'}
                conversationName={activeConversation.name}
                participants={activeConversation.type === 'team'
                  ? (activeConversation.participants || [])
                  : [activeConversation.participant].filter(Boolean)}
                messages={activeMessages}
                onSendMessage={(payload) => sendMessage(activeConversationId, payload)}
                onTyping={(isTyping) => emitTyping(activeConversationId, isTyping)}
                connectionStatus={connectionStatus}
                typingUsers={activeTyping}
                currentUserId={currentUser.id}
                hasMore={hasMoreByConversation[activeConversationId]}
                onLoadOlder={() => loadOlderMessages(activeConversationId)}
                loadingMessages={loadingMessagesByConversation[activeConversationId]}
                sending={sendingByConversation[activeConversationId]}
                onReact={toggleReaction}
              />
              {errorByConversation[activeConversationId] && (
                <p style={{ marginTop: 10, fontSize: '0.74rem', color: '#d64545', fontWeight: 600 }}>
                  {errorByConversation[activeConversationId]}
                </p>
              )}
            </div>
          ) : (
            <div style={{
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              color: 'var(--text-soft)',
            }}>
              <div style={{ fontSize: '3rem' }}>💬</div>
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Select a conversation</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textAlign: 'center', maxWidth: 240 }}>
                Pick a matched teammate from the left or open a DM from Discover.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
