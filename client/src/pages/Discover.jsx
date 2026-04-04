import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import SwipeContainer from '../components/SwipeContainer';
import MatchesList from '../components/MatchesList';
import api from '../services/api';

const ease = [0.16, 1, 0.3, 1];

// ─── Mode toggle ─────────────────────────────────────────────────────────────

function ModeToggle({ mode, onModeChange, matchBadge }) {
  const modes = [
    { key: 'swipe', label: 'Swipe' },
    { key: 'matches', label: 'Matches' },
  ];

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      padding: 3, borderRadius: 12,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-soft)',
    }}>
      {modes.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onModeChange(key)}
          style={{
            position: 'relative', padding: '7px 20px', borderRadius: 9,
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.8rem', fontWeight: 700, background: 'transparent',
            color: mode === key ? 'white' : 'var(--text-soft)',
            transition: 'color 0.2s ease', zIndex: 1,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {mode === key && (
            <motion.div
              layoutId="discover-mode-pill"
              style={{
                position: 'absolute', inset: 0, borderRadius: 9,
                background: 'linear-gradient(135deg, var(--accent), var(--peach))',
                boxShadow: '0 2px 10px rgba(224,93,80,0.3)',
                zIndex: -1,
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          {label}
          {key === 'matches' && matchBadge > 0 && (
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: mode === 'matches' ? 'rgba(255,255,255,0.7)' : '#ef4444',
              flexShrink: 0,
            }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Left panel: tips + how it works ─────────────────────────────────────────

function LeftPanel() {
  const tips = [
    { icon: '\uD83D\uDE43', text: 'Swiping right on everyone is technically a strategy. A bad one, but a strategy.' },
    { icon: '\uD83E\uDDE0', text: 'Find someone whose skills fill your gaps. Two frontend devs do not a backend make.' },
    { icon: '\u2615', text: 'The best teams form before the coffee runs out. Swipe fast.' },
    { icon: '\uD83E\uDD1D', text: 'A high match score means your skill levels are close. Think training arc, not boss fight.' },
    { icon: '\uD83C\uDFB2', text: 'Pro tip: read the bio. People put effort into those. Allegedly.' },
  ];
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease }}
      style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      {/* Tip card */}
      <div style={{
        borderRadius: 18, background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderLeft: '3px solid var(--peach)',
        padding: '16px 16px 16px 14px', boxShadow: 'var(--shadow-soft)',
      }}>
        <div style={{ fontSize: '0.63rem', fontWeight: 700, color: 'var(--peach)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, opacity: 0.8 }}>
          Quick tip
        </div>
        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{tip.icon}</div>
        <p style={{ fontSize: '0.77rem', color: 'var(--text-body)', lineHeight: 1.65, margin: 0 }}>{tip.text}</p>
      </div>

      {/* How it works */}
      <div style={{
        borderRadius: 18, background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderLeft: '3px solid var(--lavender)',
        padding: '16px 16px 16px 14px', boxShadow: 'var(--shadow-soft)',
      }}>
        <div style={{ fontSize: '0.63rem', fontWeight: 700, color: 'var(--lavender)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, opacity: 0.8 }}>
          How it works
        </div>
        {[
          { icon: '\uD83D\uDC49', label: 'Swipe right', desc: 'show interest' },
          { icon: '\uD83D\uDC48', label: 'Swipe left', desc: 'pass on them' },
          { icon: '\uD83D\uDCAC', label: 'Mutual match', desc: 'chat opens up' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, background: 'var(--bg-warm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1 }}>{s.label}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)', marginTop: 2 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Right panel: match score legend + premium teaser ────────────────────────

function RightPanel() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease }}
      style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      {/* Match score legend */}
      <div style={{
        borderRadius: 18, background: 'var(--bg-card)', border: '1px solid var(--border)',
        padding: '18px 18px', boxShadow: 'var(--shadow-soft)',
      }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Match score
        </div>
        {[
          { range: '70 to 100%', label: 'Great fit', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { range: '40 to 69%', label: 'Decent fit', color: 'var(--honey)', bg: 'rgba(255,202,40,0.1)' },
          { range: '0 to 39%', label: 'Different path', color: 'var(--text-faint)', bg: 'rgba(128,128,128,0.08)' },
        ].map(r => (
          <div key={r.range} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: r.color }}>{r.range}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-soft)', marginLeft: 5 }}>{r.label}</span>
            </div>
          </div>
        ))}
        <p style={{ fontSize: '0.68rem', color: 'var(--text-faint)', lineHeight: 1.5, marginTop: 8, marginBottom: 0 }}>
          Based on skill level, complementarity, and hackathon experience.
        </p>
      </div>

      {/* Premium teaser */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => navigate('/billing')}
        style={{
          borderRadius: 18, padding: '18px 18px', cursor: 'pointer',
          background: 'linear-gradient(145deg, rgba(224,93,80,0.12), rgba(255,138,101,0.08))',
          border: '1px solid rgba(224,93,80,0.2)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8,
        }}>
          <div style={{ fontSize: '1rem' }}>{'\u26A1'}</div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)' }}>Go Premium</span>
        </div>
        <p style={{ fontSize: '0.74rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 10, margin: '0 0 10px' }}>
          See who already swiped right on you and boost your profile to the top.
        </p>
        <div style={{
          padding: '8px 14px', borderRadius: 10, textAlign: 'center',
          background: 'linear-gradient(135deg, var(--accent), var(--peach))',
          color: 'white', fontSize: '0.72rem', fontWeight: 700,
        }}>
          Upgrade →
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Phone frame ─────────────────────────────────────────────────────────────

function PhoneFrame({ children, onSearchClick }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* Warm ambient glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(224,93,80,0.13) 0%, rgba(255,138,101,0.06) 45%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0, filter: 'blur(12px)',
      }} />

      {/* Left side buttons (volume + mute) */}
      <div style={{ position: 'absolute', left: -11, top: 100, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Mute switch */}
        <div style={{ width: 4, height: 28, borderRadius: 2, background: 'var(--border-strong)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }} />
        {/* Volume up */}
        <div style={{ width: 4, height: 44, borderRadius: 2, background: 'var(--border-strong)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }} />
        {/* Volume down */}
        <div style={{ width: 4, height: 44, borderRadius: 2, background: 'var(--border-strong)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }} />
      </div>

      {/* Right side button (power) */}
      <div style={{ position: 'absolute', right: -11, top: 140, zIndex: 2 }}>
        <div style={{ width: 4, height: 64, borderRadius: 2, background: 'var(--border-strong)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)' }} />
      </div>

      {/* Phone shell */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: 375, height: 'min(720px, calc(100vh - 180px))',
        borderRadius: 52,
        border: '8px solid var(--border-strong)',
        background: 'var(--bg)',
        boxShadow: `
          0 48px 96px rgba(0,0,0,0.22),
          0 12px 32px rgba(0,0,0,0.14),
          0 0 0 1px rgba(255,255,255,0.04),
          inset 0 1px 0 rgba(255,255,255,0.06),
          inset 0 0 0 1px rgba(255,255,255,0.03)
        `,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Screen glare */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 15, borderRadius: '44px 44px 0 0',
        }} />

        {/* Dynamic island style notch */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 30, zIndex: 20, flexShrink: 0,
          background: '#0a0a0f',
          borderRadius: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: 16, gap: 6,
        }}>
          {/* Mic dot */}
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a1a2a' }} />
          {/* Camera dot */}
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1a1a2a', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: 'rgba(66,165,245,0.15)' }} />
          </div>
        </div>

        {/* App header inside phone */}
        <div style={{
          padding: '50px 20px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-dark)' }}>Discover</div>
            <div style={{ fontSize: '0.63rem', color: 'var(--text-soft)', fontWeight: 500 }}>Find your teammate</div>
          </div>
          <div
            onClick={onSearchClick}
            style={{
              width: 34, height: 34, borderRadius: 11, background: 'var(--bg-warm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: onSearchClick ? 'pointer' : 'default',
              border: '1px solid var(--border)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>

        {/* Card area */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {children}
        </div>

        {/* Home indicator */}
        <div style={{
          height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <div style={{
            width: 120, height: 4.5, borderRadius: 3,
            background: 'var(--border-strong)',
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── Discover page ───────────────────────────────────────────────────────────

export default function Discover() {
  const [mode, setMode] = useState('swipe');
  const [showPanels, setShowPanels] = useState(window.innerWidth >= 960);
  const [matchBadge, setMatchBadge] = useState(0);

  useEffect(() => {
    const onResize = () => setShowPanels(window.innerWidth >= 960);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Poll for unread match notifications
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const { data } = await api.get('/api/v1/notifications');
        if (!cancelled) setMatchBadge(data.unreadMatchCount || 0);
      } catch { /* silent */ }
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const handleNewMatch = useCallback(() => setMatchBadge((n) => n + 1), []);

  const handleModeChange = (next) => {
    setMode(next);
    if (next === 'matches') setMatchBadge(0);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 24px 0', flexShrink: 0 }}>
          <ModeToggle mode={mode} onModeChange={handleModeChange} matchBadge={matchBadge} />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {mode === 'swipe' ? (
            <motion.div
              key="swipe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 28, padding: '12px 24px 16px', overflow: 'hidden',
              }}
            >
              {showPanels && <LeftPanel />}
              <PhoneFrame onSearchClick={() => handleModeChange('browse')}>
                <SwipeContainer onNewMatch={handleNewMatch} />
              </PhoneFrame>
              {showPanels && <RightPanel />}
            </motion.div>
          ) : (
            <motion.div
              key="matches"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ flex: 1, overflow: 'auto', padding: '20px 24px 24px' }}
            >
              <MatchesList onUnreadCount={setMatchBadge} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
