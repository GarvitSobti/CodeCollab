import React from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

export default function ChatComponent({
  chatType = 'dm',
  conversationName,
  participants = [],
  messages = [],
  onSendMessage,
  onTyping,
  connectionStatus = 'disconnected',
  typingUsers = [],
  currentUserId,
  headerActions = null,
  hasMore = false,
  onLoadOlder,
  loadingMessages = false,
  sending = false,
  onReact,
}) {
  const isTeam = chatType === 'team';
  const primaryParticipant = participants[0] || {};
  const isOnline = !isTeam && Boolean(primaryParticipant.online);
  const onlineCount = isTeam ? participants.filter((p) => p.online).length : 0;
  const statusColor = {
    connected: '#66bb6a',
    connecting: '#ffca28',
    disconnected: '#ef9a9a',
  }[connectionStatus] || '#ef9a9a';

  const statusLabel = {
    connected: 'Live',
    connecting: 'Connecting…',
    disconnected: 'Offline',
  }[connectionStatus] || 'Offline';

  const teamInitials = isTeam
    ? (conversationName || 'T').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : null;

  const headerName = isTeam
    ? (conversationName || 'Team Chat')
    : (primaryParticipant.name || 'Unknown');

  const headerSubtext = isTeam
    ? `${participants.length + 1} members${onlineCount > 0 ? ` · ${onlineCount} online` : ''}`
    : (isOnline ? 'Online now' : 'Offline');

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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 22px',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        flexShrink: 0,
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: isTeam ? 12 : 13,
            background: isTeam
              ? 'linear-gradient(135deg,#667eea,#764ba2)'
              : (primaryParticipant.gradient || 'linear-gradient(135deg,#ff8a65,#ff6b6b)'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: 'white',
          }}>
            {isTeam ? teamInitials : (primaryParticipant.initials || '?')}
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
              width: 11,
              height: 11,
              borderRadius: '50%',
              background: isOnline ? 'var(--mint)' : 'var(--text-faint)',
              border: '2px solid var(--bg-card)',
            }} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 1 }}>
            {headerName}
          </h3>
          <p style={{
            fontSize: '0.68rem',
            fontWeight: 500,
            color: isTeam ? 'var(--text-soft)' : (isOnline ? 'var(--mint)' : 'var(--text-soft)'),
          }}>
            {headerSubtext}
          </p>
        </div>

        {headerActions}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          borderRadius: 20,
          background: `${statusColor}18`,
          flexShrink: 0,
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: statusColor,
          }} />
          <span style={{ fontSize: '0.6rem', fontWeight: 600, color: statusColor }}>
            {statusLabel}
          </span>
        </div>
      </div>

      <MessageList
        messages={messages}
        participants={participants}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        hasMore={hasMore}
        loading={loadingMessages}
        onLoadOlder={onLoadOlder}
        onReact={onReact}
        chatType={chatType}
      />

      <MessageInput
        onSend={onSendMessage}
        onTyping={onTyping}
        disabled={connectionStatus === 'disconnected'}
        sending={sending}
      />
    </div>
  );
}
