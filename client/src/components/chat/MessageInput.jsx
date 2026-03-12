import React, { useState, useRef, useEffect, useCallback } from 'react';

const EMOJI_LIST = [
  '😊','😂','🥹','❤️','🔥','👍','🙌','🎉',
  '🚀','💡','🤔','😅','👀','💪','✨','🤝',
  '😎','🥳','😭','💯','🙏','👋','⚡','🎯',
];

function EmojiPicker({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute', bottom: '100%', left: 0, marginBottom: 8,
      background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 16, padding: 12, boxShadow: 'var(--shadow-heavy)',
      display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4,
      zIndex: 100, width: 240,
    }}>
      {EMOJI_LIST.map(emoji => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          style={{
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '1.2rem', padding: '4px', borderRadius: 8,
            transition: 'transform 0.1s, background 0.1s',
            lineHeight: 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.3)'; e.currentTarget.style.background = 'var(--bg)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'none'; }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export default function MessageInput({ onSend, onTyping, disabled = false }) {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback((isTyping) => {
    if (isTypingRef.current === isTyping) return;
    isTypingRef.current = isTyping;
    onTyping?.(isTyping);
  }, [onTyping]);

  const handleChange = (e) => {
    setValue(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
    // Typing indicator
    handleTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => handleTyping(false), 1500);
  };

  const handleSend = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    handleTyping(false);
    clearTimeout(typingTimer.current);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji) => {
    setValue(prev => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    return () => clearTimeout(typingTimer.current);
  }, []);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 8,
      padding: '14px 20px',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      background: 'var(--bg-card)',
    }}>
      {/* Emoji button */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {showEmoji && <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmoji(false)} />}
        <button
          onClick={() => setShowEmoji(s => !s)}
          style={{
            width: 36, height: 36, border: 'none', cursor: 'pointer',
            background: showEmoji ? 'var(--bg)' : 'transparent',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', transition: 'background 0.2s',
            flexShrink: 0,
          }}
          title="Emoji"
        >
          😊
        </button>
      </div>

      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Enter to send)"
        rows={1}
        style={{
          flex: 1, padding: '10px 14px',
          borderRadius: 14, background: 'var(--bg)',
          border: '1px solid rgba(0,0,0,0.06)',
          fontFamily: 'inherit', fontSize: '0.82rem',
          color: 'var(--text-dark)', outline: 'none',
          resize: 'none', overflow: 'hidden',
          lineHeight: 1.55, minHeight: 38, maxHeight: 120,
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--peach)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.06)'; }}
        disabled={disabled}
      />

      {/* Attachment (UI only) */}
      <button
        style={{
          width: 36, height: 36, border: 'none', cursor: 'pointer',
          background: 'transparent', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-soft)', flexShrink: 0,
          transition: 'color 0.2s',
        }}
        title="Attach file (coming soon)"
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--peach)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-soft)'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!canSend}
        style={{
          width: 40, height: 40, border: 'none',
          borderRadius: 13, flexShrink: 0,
          background: canSend
            ? 'linear-gradient(135deg, var(--peach), var(--coral))'
            : 'var(--bg)',
          cursor: canSend ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          transform: canSend ? 'scale(1)' : 'scale(0.9)',
          boxShadow: canSend ? '0 4px 12px rgba(255,107,107,0.3)' : 'none',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={canSend ? 'white' : 'var(--text-faint)'} strokeWidth="2.2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  );
}
