import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const EMOJI_LIST = [
  '😊', '😂', '🥹', '❤️', '🔥', '👍', '🙌', '🎉',
  '🚀', '💡', '🤔', '😅', '👀', '💪', '✨', '🤝',
  '😎', '🥳', '😭', '💯', '🙏', '👋', '⚡', '🎯',
];
const EMOJI_PICKER_WIDTH = 392;

function EmojiPicker({ anchorRef, onSelect, onClose }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const viewportPadding = 12;
    const nextLeft = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - EMOJI_PICKER_WIDTH - viewportPadding
    );

    setPosition({
      top: rect.top - 184,
      left: nextLeft,
    });
  }, [anchorRef]);

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  useLayoutEffect(() => {
    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);

  return createPortal(
    <div ref={ref} style={{
      position: 'fixed',
      top: Math.max(12, position.top),
      left: position.left,
      background: 'var(--bg-card)',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 18,
      padding: 14,
      boxShadow: 'var(--shadow-heavy)',
      display: 'grid',
      gridTemplateColumns: 'repeat(8, 40px)',
      gap: 6,
      zIndex: 1000,
      width: EMOJI_PICKER_WIDTH,
      boxSizing: 'border-box',
    }}>
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            width: 40,
            height: 40,
            fontSize: '1.35rem',
            lineHeight: 1,
            padding: 0,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {emoji}
        </button>
      ))}
    </div>,
    document.body
  );
}

export default function MessageInput({ onSend, onTyping, disabled = false, sending = false }) {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const typingTimer = useRef(null);
  const isTypingRef = useRef(false);

  const emitTyping = useCallback((isTyping) => {
    if (isTypingRef.current === isTyping) {
      return;
    }
    isTypingRef.current = isTyping;
    onTyping?.(isTyping);
  }, [onTyping]);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    resizeTextarea();
    emitTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(false), 1500);
  };

  const clearComposer = () => {
    setValue('');
    setSelectedFile(null);
    emitTyping(false);
    clearTimeout(typingTimer.current);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    const body = value.trim();
    if ((!body && !selectedFile) || disabled || sending) {
      return;
    }

    try {
      await onSend?.({
        body,
        file: selectedFile,
      });

      clearComposer();
      textareaRef.current?.focus();
    } catch (error) {
      // The parent surface already renders send errors.
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji) => {
    setValue((current) => `${current}${emoji}`);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setSelectedFile(nextFile);
  };

  useEffect(() => () => clearTimeout(typingTimer.current), []);
  useEffect(() => resizeTextarea(), [value]);

  const canSend = (!disabled && !sending) && (value.trim().length > 0 || selectedFile);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '14px 20px',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      background: 'var(--bg-card)',
    }}>
      {selectedFile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderRadius: 12,
          background: 'var(--bg)',
          fontSize: '0.74rem',
          color: 'var(--text-body)',
        }}>
          <span>{selectedFile.name}</span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            style={{
              border: 'none',
              background: 'none',
              color: 'var(--coral)',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Remove
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {showEmoji && (
            <EmojiPicker
              anchorRef={emojiButtonRef}
              onSelect={insertEmoji}
              onClose={() => setShowEmoji(false)}
            />
          )}
          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => setShowEmoji((current) => !current)}
            style={{
              width: 36,
              height: 36,
              border: 'none',
              cursor: 'pointer',
              background: showEmoji ? 'var(--bg)' : 'transparent',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showEmoji ? 'var(--coral)' : 'var(--text-soft)',
            }}
            title="Open emoji picker"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8" />
              <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
              <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          disabled={disabled || sending}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 14,
            background: 'var(--bg)',
            border: '1px solid rgba(0,0,0,0.06)',
            fontFamily: 'inherit',
            fontSize: '0.82rem',
            color: 'var(--text-dark)',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            lineHeight: 1.55,
            minHeight: 38,
            maxHeight: 120,
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept="image/*,.pdf,.txt,.zip"
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 36,
            height: 36,
            border: 'none',
            cursor: 'pointer',
            background: selectedFile ? 'var(--bg)' : 'transparent',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: selectedFile ? 'var(--peach)' : 'var(--text-soft)',
          }}
          title="Attach file"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: 40,
            height: 40,
            border: 'none',
            borderRadius: 13,
            background: canSend
              ? 'linear-gradient(135deg, var(--peach), var(--coral))'
              : 'var(--bg)',
            cursor: canSend ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: canSend ? '0 4px 12px rgba(255,107,107,0.3)' : 'none',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={canSend ? 'white' : 'var(--text-faint)'} strokeWidth="2.2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
