import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import ChatComponent from '../components/chat/ChatComponent';
import { useChatContext } from '../contexts/ChatContext';

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
    setActiveConversation,
    sendMessage,
    emitTyping,
    openOrCreateDM,
  } = useChatContext();

  const [search, setSearch] = useState('');

  // Deep-link: if /messages/:userId open that DM
  useEffect(() => {
    if (userId) {
      const existing = conversations.find(c => c.participant?.id === userId);
      if (existing) {
        setActiveConversation(existing.id);
      } else {
        // Create a new conversation placeholder
        openOrCreateDM({
          id: userId,
          name: userId,
          initials: userId.slice(0, 2).toUpperCase(),
          gradient: 'linear-gradient(135deg,#b39ddb,#7e57c2)',
          online: false,
        });
      }
      // Clean URL
      navigate('/messages', { replace: true });
    }
  }, [userId]); // eslint-disable-line

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const activeMessages = messages[activeConversationId] || [];
  const activeTyping = typingUsers[activeConversationId] || [];

  const filtered = conversations.filter(c =>
    c.participant?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

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
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 6 }}>
            💌 <span className="flowing-text">Messages</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>
            Stay connected with your collaborators and matched teammates.
            {totalUnread > 0 && (
              <span style={{
                marginLeft: 10, padding: '2px 10px', borderRadius: 20,
                background: 'linear-gradient(135deg, var(--peach), var(--coral))',
                color: 'white', fontSize: '0.72rem', fontWeight: 700,
              }}>
                {totalUnread} unread
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, minHeight: 600, height: 'calc(100vh - 240px)' }}>
          {/* ── Conversation Sidebar ── */}
          <div style={{
            borderRadius: 'var(--radius)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Search */}
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  style={{
                    width: '100%', padding: '9px 12px 9px 34px',
                    borderRadius: 12, background: 'var(--bg)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    fontFamily: 'inherit', fontSize: '0.78rem',
                    color: 'var(--text-dark)', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-soft)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>💬</div>
                  <p style={{ fontSize: '0.8rem' }}>No conversations yet</p>
                </div>
              ) : (
                filtered.map(conv => {
                  const isActive = conv.id === activeConversationId;
                  const p = conv.participant || {};
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setActiveConversation(conv.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px', cursor: 'pointer',
                        borderLeft: `3px solid ${isActive ? 'var(--peach)' : 'transparent'}`,
                        background: isActive ? 'rgba(255,138,101,0.07)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(0,0,0,0.025)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Avatar */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 13,
                          background: p.gradient || 'var(--bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.78rem', color: 'white',
                        }}>
                          {p.initials || '?'}
                        </div>
                        <div style={{
                          position: 'absolute', bottom: -1, right: -1,
                          width: 10, height: 10, borderRadius: '50%',
                          background: p.online ? 'var(--mint)' : 'var(--text-faint)',
                          border: '2px solid var(--bg-card)',
                        }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                          <h4 style={{ fontSize: '0.84rem', fontWeight: 700, margin: 0 }}>{p.name || 'Unknown'}</h4>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)', flexShrink: 0, marginLeft: 6 }}>{conv.lastTime}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{
                            fontSize: '0.71rem', color: 'var(--text-soft)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            flex: 1, minWidth: 0, margin: 0,
                          }}>
                            {(typingUsers[conv.id] || []).length > 0
                              ? <em style={{ color: 'var(--peach)' }}>typing…</em>
                              : conv.lastMessage || 'No messages yet'
                            }
                          </p>
                          {conv.unread > 0 && (
                            <div style={{
                              width: 18, height: 18, borderRadius: '50%', marginLeft: 6, flexShrink: 0,
                              background: 'linear-gradient(135deg, var(--peach), var(--coral))',
                              color: 'white', fontSize: '0.55rem', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {conv.unread}
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

          {/* ── Chat Panel ── */}
          {activeConv ? (
            <ChatComponent
              chatType={activeConv.type || 'dm'}
              participants={[activeConv.participant].filter(Boolean)}
              messages={activeMessages}
              onSendMessage={(text) => sendMessage(activeConversationId, text)}
              onTyping={(isTyping) => emitTyping(activeConversationId, isTyping)}
              connectionStatus={connectionStatus}
              typingUsers={activeTyping}
              currentUserId={currentUser.id}
            />
          ) : (
            <div style={{
              borderRadius: 'var(--radius)', background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 14, color: 'var(--text-soft)',
            }}>
              <div style={{ fontSize: '3rem' }}>💬</div>
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Select a conversation</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textAlign: 'center', maxWidth: 240 }}>
                Pick someone from the left, or match with a teammate on the Discover page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
