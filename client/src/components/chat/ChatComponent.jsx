import React from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

export default function ChatComponent({
  chatType = 'dm',
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
  const primaryParticipant = participants[0] || {};
  const isOnline = Boolean(primaryParticipant.online);
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
            borderRadius: 13,
            background: primaryParticipant.gradient || 'linear-gradient(135deg,#ff8a65,#ff6b6b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: 'white',
          }}>
            {primaryParticipant.initials || '?'}
          </div>
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
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 1 }}>
            {chatType === 'group' ? 'Group Chat' : primaryParticipant.name || 'Unknown'}
          </h3>
          <p style={{
            fontSize: '0.68rem',
            fontWeight: 500,
            color: isOnline ? 'var(--mint)' : 'var(--text-soft)',
          }}>
            {isOnline ? 'Online now' : 'Offline'}
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
