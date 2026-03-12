import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

/**
 * Reusable chat component for both DM and group contexts.
 *
 * Props:
 *   chatType          'dm' | 'group'
 *   participants      [{ id, name, initials, gradient, online }]  — other participants (not current user)
 *   messages          Message[]
 *   onSendMessage     (text: string) => void
 *   onTyping          (isTyping: boolean) => void
 *   connectionStatus  'connected' | 'connecting' | 'disconnected'
 *   typingUsers       string[]  — ids of users currently typing
 *   currentUserId     string
 *   showHeader        boolean  (default true)
 *   headerActions     ReactNode  — extra buttons to render in header (e.g. video call for group)
 */
export default function ChatComponent({
  chatType = 'dm',
  participants = [],
  messages = [],
  onSendMessage,
  onTyping,
  connectionStatus = 'disconnected',
  typingUsers = [],
  currentUserId = 'me',
  showHeader = true,
  headerActions = null,
}) {
  const primaryParticipant = participants[0] || {};
  const isOnline = primaryParticipant.online || false;

  // Connection status pill
  const statusColor = {
    connected: '#66bb6a',
    connecting: '#ffca28',
    disconnected: '#ef9a9a',
  }[connectionStatus];

  const statusLabel = {
    connected: 'Live',
    connecting: 'Connecting…',
    disconnected: 'Offline',
  }[connectionStatus];

  // Header subtitle
  let subtitle;
  if (chatType === 'group') {
    subtitle = `${participants.length} member${participants.length !== 1 ? 's' : ''}`;
  } else {
    subtitle = isOnline ? 'Online now' : 'Offline';
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRadius: 'var(--radius)',
      background: 'var(--bg-card)',
      boxShadow: 'var(--shadow-card)',
      border: '1px solid rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      {showHeader && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 22px',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          flexShrink: 0,
        }}>
          {/* Avatar / group avatars */}
          {chatType === 'group' ? (
            <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
              {participants.slice(0, 2).map((p, i) => (
                <div key={p.id} style={{
                  position: 'absolute',
                  width: 28, height: 28,
                  borderRadius: 9,
                  background: p.gradient || 'var(--bg)',
                  border: '2px solid var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.5rem', fontWeight: 800, color: 'white',
                  top: i === 0 ? 0 : 'auto',
                  bottom: i === 1 ? 0 : 'auto',
                  left: i === 0 ? 0 : 'auto',
                  right: i === 1 ? 0 : 'auto',
                  zIndex: 2 - i,
                }}>{p.initials}</div>
              ))}
            </div>
          ) : (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13,
                background: primaryParticipant.gradient || 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.8rem', color: 'white',
              }}>
                {primaryParticipant.initials || '?'}
              </div>
              <div style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 11, height: 11, borderRadius: '50%',
                background: isOnline ? 'var(--mint)' : 'var(--text-faint)',
                border: '2px solid var(--bg-card)',
              }} />
            </div>
          )}

          {/* Name + subtitle */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 1 }}>
              {chatType === 'group'
                ? (participants.map(p => p.name).join(', ') || 'Group Chat')
                : primaryParticipant.name || 'Unknown'
              }
            </h3>
            <p style={{
              fontSize: '0.68rem', fontWeight: 500,
              color: isOnline && chatType === 'dm' ? 'var(--mint)' : 'var(--text-soft)',
            }}>
              {subtitle}
            </p>
          </div>

          {/* Extra actions slot (for group: video call, settings, etc.) */}
          {headerActions}

          {/* Connection status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 20,
            background: `${statusColor}18`,
            flexShrink: 0,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: statusColor,
              animation: connectionStatus === 'connecting' ? 'pulse 1s ease-in-out infinite' : 'none',
            }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 600, color: statusColor }}>
              {statusLabel}
            </span>
          </div>
        </div>
      )}

      {/* ── Message List ── */}
      <MessageList
        messages={messages}
        participants={participants}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        chatType={chatType}
      />

      {/* ── Input ── */}
      <MessageInput
        onSend={onSendMessage}
        onTyping={onTyping}
        disabled={false}
      />
    </div>
  );
}
