import React, { useEffect, useRef } from 'react';

function getDateLabel(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-SG', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentLabel = null;

  messages.forEach((message) => {
    const label = getDateLabel(message.sentAt);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ type: 'date', label });
    }
    groups.push({ type: 'message', ...message });
  });

  return groups;
}

function ReactionPill({ reaction, currentUserId, onReact }) {
  const selected = reaction.userIds?.includes(currentUserId);
  return (
    <button
      type="button"
      onClick={() => onReact?.(reaction.emoji)}
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        background: selected ? 'rgba(255,138,101,0.12)' : 'rgba(0,0,0,0.03)',
        color: selected ? 'var(--coral)' : 'var(--text-soft)',
        borderRadius: 999,
        padding: '4px 8px',
        fontSize: '0.66rem',
        cursor: 'pointer',
      }}
    >
      {reaction.emoji} {reaction.count}
    </button>
  );
}

function Attachment({ message }) {
  if (!message.attachmentUrl) {
    return null;
  }

  const fullUrl = message.attachmentUrl.startsWith('http')
    ? message.attachmentUrl
    : `${process.env.REACT_APP_API_URL || 'http://localhost:3003'}${message.attachmentUrl}`;

  if (message.messageType === 'image') {
    return (
      <a href={fullUrl} target="_blank" rel="noreferrer">
        <img
          src={fullUrl}
          alt={message.attachmentName || 'Uploaded'}
          style={{ width: '100%', maxWidth: 240, borderRadius: 14, marginTop: message.body ? 10 : 0 }}
        />
      </a>
    );
  }

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 12,
        background: 'rgba(255,255,255,0.16)',
        color: 'inherit',
        textDecoration: 'none',
        marginTop: message.body ? 10 : 0,
      }}
    >
      <span>📎</span>
      <span style={{ fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{message.attachmentName}</span>
    </a>
  );
}

function LinkPreview({ preview, isSelf }) {
  if (!preview) {
    return null;
  }

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'block',
        marginTop: 10,
        padding: 12,
        borderRadius: 12,
        textDecoration: 'none',
        background: isSelf ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.04)',
        color: 'inherit',
      }}
    >
      <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: 4 }}>{preview.title}</div>
      <div style={{ fontSize: '0.66rem', opacity: 0.85, marginBottom: 6 }}>{preview.description}</div>
      <div style={{ fontSize: '0.62rem', opacity: 0.72 }}>{preview.hostname}</div>
    </a>
  );
}

function MessageBubble({ message, participant, isSelf, currentUserId, onReact, showSender }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: isSelf ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 8,
    }}>
      {!isSelf && (
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          flexShrink: 0,
          background: participant?.gradient || 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.55rem',
          fontWeight: 800,
          color: 'white',
        }}>
          {participant?.initials || '?'}
        </div>
      )}

      <div style={{ maxWidth: '72%' }}>
        {showSender && !isSelf && (
          <div style={{ fontSize: '0.64rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: 3, paddingLeft: 2 }}>
            {participant?.name || message.sender?.name || 'Unknown'}
          </div>
        )}
        <div style={{
          padding: '10px 14px',
          borderRadius: 16,
          borderTopRightRadius: isSelf ? 4 : 16,
          borderTopLeftRadius: isSelf ? 16 : 4,
          fontSize: '0.82rem',
          lineHeight: 1.55,
          background: isSelf
            ? 'linear-gradient(135deg, var(--peach), var(--coral))'
            : 'var(--bg)',
          color: isSelf ? 'white' : 'var(--text-body)',
          wordBreak: 'break-word',
          opacity: message.isPending ? 0.72 : 1,
          border: message.isFailed ? '1px solid #d64545' : 'none',
        }}>
          {message.body && <div>{message.body}</div>}
          <Attachment message={message} />
          <LinkPreview preview={message.linkPreview} isSelf={isSelf} />
        </div>

        {message.reactions?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {message.reactions.map((reaction) => (
              <ReactionPill
                key={`${message.id}-${reaction.emoji}`}
                reaction={reaction}
                currentUserId={currentUserId}
                onReact={() => onReact?.(message.id, reaction.emoji)}
              />
            ))}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: isSelf ? 'flex-end' : 'flex-start',
          gap: 6,
          marginTop: 4,
          fontSize: '0.6rem',
          color: 'var(--text-faint)',
        }}>
          <span>{new Date(message.sentAt).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}</span>
          {isSelf && <span>{message.read ? 'Read' : message.isPending ? 'Sending…' : message.isFailed ? 'Failed' : 'Sent'}</span>}
        </div>
      </div>
    </div>
  );
}

export default function MessageList({
  messages = [],
  participants = [],
  currentUserId,
  typingUsers = [],
  onLoadOlder,
  hasMore = false,
  loading = false,
  onReact,
  chatType = 'dm',
}) {
  const isGroupChat = chatType === 'team' || chatType === 'group';
  const bottomRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    // Only auto-scroll when the user is already near the bottom.
    const threshold = 150;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, typingUsers]);

  const groupedMessages = groupMessagesByDate(messages);
  const participantMap = {};
  participants.forEach((participant) => {
    participantMap[participant.id] = participant;
  });

  if (!messages.length && !typingUsers.length) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: 'var(--text-soft)',
      }}>
        <div style={{ fontSize: '2.5rem' }}>👋</div>
        <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No messages yet. Say hi!</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textAlign: 'center', maxWidth: 220 }}>
          Start the conversation and see whether your next teammate is the right fit.
        </p>
      </div>
    );
  }

  return (
    <div ref={listRef} style={{
      flex: 1,
      overflowY: 'auto',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      minHeight: 0,
    }}>
      {hasMore && (
        <button
          type="button"
          onClick={onLoadOlder}
          disabled={loading}
          style={{
            alignSelf: 'center',
            border: '1px solid rgba(0,0,0,0.08)',
            background: 'var(--bg-card)',
            borderRadius: 999,
            padding: '8px 14px',
            fontSize: '0.72rem',
            color: 'var(--text-soft)',
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          {loading ? 'Loading…' : 'Load older messages'}
        </button>
      )}

      {groupedMessages.map((item, index) => {
        if (item.type === 'date') {
          return (
            <div key={`date-${index}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '12px 0 8px',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {item.label}
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
            </div>
          );
        }

        const isSelf = item.senderId === currentUserId;
        const participant = participantMap[item.senderId] || item.sender;

        const prevItem = groupedMessages[index - 1];
        const showSender = isGroupChat && (!prevItem || prevItem.type === 'date' || prevItem.senderId !== item.senderId);

        return (
          <MessageBubble
            key={item.id || item.clientMessageId || index}
            message={item}
            participant={participant}
            isSelf={isSelf}
            currentUserId={currentUserId}
            onReact={onReact}
            showSender={showSender}
          />
        );
      })}

      {typingUsers.length > 0 && (
        <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)', fontStyle: 'italic', paddingLeft: 8 }}>
          {typingUsers.map((userId) => participantMap[userId]?.name || userId).join(', ')} typing…
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
