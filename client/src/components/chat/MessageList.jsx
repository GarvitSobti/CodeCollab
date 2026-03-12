import React, { useEffect, useRef } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDateLabel(timeStr) {
  // For mock data we just use Today; in production you'd compare real dates
  return 'Today';
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentLabel = null;
  messages.forEach(msg => {
    const label = getDateLabel(msg.time);
    if (label !== currentLabel) {
      currentLabel = label;
      groups.push({ type: 'date', label });
    }
    groups.push({ type: 'message', ...msg });
  });
  return groups;
}

// ─── Read Receipt Icon ────────────────────────────────────────────────────────
function ReadTick({ read }) {
  const color = read ? '#42a5f5' : 'rgba(255,255,255,0.5)';
  return (
    <svg width="14" height="9" viewBox="0 0 14 9" fill="none" style={{ marginLeft: 4, flexShrink: 0 }}>
      <path d="M1 4.5L4 7.5L9 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {read && <path d="M5 4.5L8 7.5L13 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>}
    </svg>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingBubble({ names, chatType }) {
  const label = chatType === 'group' && names.length > 0
    ? `${names.join(', ')} ${names.length === 1 ? 'is' : 'are'} typing`
    : 'typing';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 3,
        padding: '10px 16px', borderRadius: 16, borderTopLeftRadius: 4,
        background: 'var(--bg)', maxWidth: 80,
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--text-soft)',
            animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)', fontStyle: 'italic' }}>{label}</span>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Single Message Bubble ────────────────────────────────────────────────────
function MessageBubble({ msg, participant, chatType, isSelf }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: isSelf ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 4,
    }}>
      {!isSelf && (
        <div style={{
          width: 28, height: 28, borderRadius: 9, flexShrink: 0,
          background: participant?.gradient || 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.55rem', fontWeight: 800, color: 'white',
        }}>
          {participant?.initials || '?'}
        </div>
      )}

      <div style={{ maxWidth: '68%' }}>
        {!isSelf && chatType === 'group' && (
          <div style={{ fontSize: '0.62rem', color: 'var(--text-soft)', marginBottom: 3, paddingLeft: 2, fontWeight: 600 }}>
            {participant?.name || 'Unknown'}
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
        }}>
          {msg.text}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSelf ? 'flex-end' : 'flex-start',
          gap: 2,
          marginTop: 3,
          paddingLeft: isSelf ? 0 : 2,
          paddingRight: isSelf ? 2 : 0,
        }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)' }}>{msg.time}</span>
          {isSelf && <ReadTick read={msg.read} />}
        </div>
      </div>
    </div>
  );
}

// ─── MessageList ──────────────────────────────────────────────────────────────
export default function MessageList({ messages = [], participants = [], currentUserId, typingUsers = [], chatType = 'dm' }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const grouped = groupMessagesByDate(messages);

  // Build participant lookup by id
  const participantMap = {};
  participants.forEach(p => { participantMap[p.id] = p; });

  if (messages.length === 0 && typingUsers.length === 0) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, color: 'var(--text-soft)',
      }}>
        <div style={{ fontSize: '2.5rem' }}>👋</div>
        <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>No messages yet. Say hi!</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', textAlign: 'center', maxWidth: 220 }}>
          Start the conversation and find your perfect hackathon teammate.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto', padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0,
    }}>
      {grouped.map((item, idx) => {
        if (item.type === 'date') {
          return (
            <div key={`date-${idx}`} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '12px 0 8px',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.06)' }} />
            </div>
          );
        }

        const isSelf = item.senderId === currentUserId;
        const participant = participantMap[item.senderId];

        return (
          <MessageBubble
            key={item.id || idx}
            msg={item}
            participant={participant}
            chatType={chatType}
            isSelf={isSelf}
          />
        );
      })}

      {typingUsers.length > 0 && (
        <TypingBubble
          names={typingUsers.map(uid => participantMap[uid]?.name || uid)}
          chatType={chatType}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
}
