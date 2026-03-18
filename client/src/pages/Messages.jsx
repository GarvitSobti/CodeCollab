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
    const participantName = conversation.participant?.name ?? '';
    return participantName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>
      <div className="noise" />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 6 }}>
            💌 <span className="flowing-text">Messages</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>
            Talk to potential teammates before you lock in a team.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, minHeight: 600, height: 'calc(100vh - 240px)' }}>
          <div style={{
            borderRadius: 'var(--radius)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations…"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: 12,
                    background: 'var(--bg)',
                    border: '1px solid rgba(0,0,0,0.06)',
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
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-soft)' }}>Loading conversations…</div>
              ) : filteredConversations.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-soft)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>💬</div>
                  <p style={{ fontSize: '0.8rem' }}>No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const isActive = conversation.id === activeConversationId;
                  const participant = conversation.participant || {};
                  const lastMessageLabel = (typingUsers[conversation.id] || []).length > 0
                    ? 'typing…'
                    : conversation.lastMessage?.attachmentName
                      ? `📎 ${conversation.lastMessage.attachmentName}`
                      : conversation.lastMessage?.body || 'No messages yet';

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
                        borderLeft: `3px solid ${isActive ? 'var(--peach)' : 'transparent'}`,
                        background: isActive ? 'rgba(255,138,101,0.07)' : 'transparent',
                      }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 42,
                          height: 42,
                          borderRadius: 13,
                          background: participant.gradient || 'linear-gradient(135deg,#ff8a65,#ff6b6b)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          color: 'white',
                        }}>
                          {participant.initials || '?'}
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: -1,
                          right: -1,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: participant.online ? 'var(--mint)' : 'var(--text-faint)',
                          border: '2px solid var(--bg-card)',
                        }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                          <h4 style={{ fontSize: '0.84rem', fontWeight: 700, margin: 0 }}>{participant.name || 'Unknown'}</h4>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)' }}>{formatRelativeTime(conversation.lastActivityAt)}</span>
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
                              background: 'linear-gradient(135deg, var(--peach), var(--coral))',
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
                participants={[activeConversation.participant].filter(Boolean)}
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
              border: '1px solid rgba(0,0,0,0.04)',
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
