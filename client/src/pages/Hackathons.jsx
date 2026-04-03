import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '../components/Navigation';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FILTERS = ['All Events', 'Live Now', 'Open Registration', 'Coming Soon'];

const STATUS_META = {
  LIVE: {
    label: 'Live Now',
    color: 'var(--accent)',
    bg: 'rgba(224,93,80,0.12)',
    border: 'rgba(224,93,80,0.25)',
    dot: true,
    gradient: 'linear-gradient(135deg, #e05d50, #ff8a65)',
  },
  OPEN: {
    label: 'Open',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.2)',
    dot: false,
    gradient: 'linear-gradient(135deg, #22c55e, #4dd0e1)',
  },
  SOON: {
    label: 'Coming Soon',
    color: 'var(--sky)',
    bg: 'rgba(66,165,245,0.1)',
    border: 'rgba(66,165,245,0.2)',
    dot: false,
    gradient: 'linear-gradient(135deg, #42a5f5, #b39ddb)',
  },
  ENDED: {
    label: 'Ended',
    color: 'var(--text-faint)',
    bg: 'rgba(128,128,128,0.08)',
    border: 'rgba(128,128,128,0.12)',
    dot: false,
    gradient: 'linear-gradient(135deg, #888, #aaa)',
  },
};

const DIFF_META = {
  BEGINNER: { label: 'Beginner', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  INTERMEDIATE: { label: 'Intermediate', color: 'var(--sky)', bg: 'rgba(66,165,245,0.1)' },
  ADVANCED: { label: 'Advanced', color: 'var(--accent)', bg: 'rgba(224,93,80,0.1)' },
};

function formatDateRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const opts = { month: 'short', day: 'numeric' };
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('en-SG', opts)}–${e.getDate()}`;
  }
  return `${s.toLocaleDateString('en-SG', opts)} – ${e.toLocaleDateString('en-SG', opts)}`;
}

function formatDeadline(date) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  if (diffDays === 0) return 'Closes today';
  if (diffDays === 1) return 'Closes tomorrow';
  if (diffDays <= 7) return `Closes in ${diffDays} days`;
  return `Deadline: ${d.toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}`;
}

function HackathonCard({ h, isRegistered, isToggling, onToggle, isAuthenticated, idx }) {
  const meta = STATUS_META[h.status] || STATUS_META.SOON;
  const diff = DIFF_META[h.difficultyLevel] || DIFF_META.INTERMEDIATE;
  const deadline = formatDeadline(h.registrationDeadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 20, background: 'var(--bg-card)',
        border: `1px solid var(--border)`,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        cursor: 'default',
      }}
      whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)', y: -2 }}
    >
      {/* Color stripe header */}
      <div style={{
        height: 6, background: meta.gradient, flexShrink: 0,
      }} />

      <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top row: status + difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 8,
            fontSize: '0.68rem', fontWeight: 700,
            background: meta.bg, color: meta.color,
            border: `1px solid ${meta.border}`,
            letterSpacing: '0.02em',
          }}>
            {meta.dot && (
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: meta.color, animation: 'pulseDot 1.6s infinite', flexShrink: 0,
              }} />
            )}
            {meta.label}
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: 8,
            fontSize: '0.68rem', fontWeight: 700,
            background: diff.bg, color: diff.color,
          }}>
            {diff.label}
          </span>
          {h.isOnline && (
            <span style={{
              padding: '4px 10px', borderRadius: 8,
              fontSize: '0.68rem', fontWeight: 700,
              background: 'rgba(179,157,219,0.1)', color: 'var(--lavender)',
            }}>Online</span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em',
          lineHeight: 1.25, marginBottom: 8, color: 'var(--text-dark)',
        }}>{h.name}</h3>

        {/* Description */}
        {h.description && (
          <p style={{
            fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: 1.6,
            marginBottom: 16,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>{h.description}</p>
        )}

        {/* Meta info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {[
            {
              icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
              text: formatDateRange(h.startDate, h.endDate),
            },
            {
              icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
              text: h.isOnline ? 'Online event' : h.location,
            },
            {
              icon: 'M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
              text: `Teams of ${h.minTeamSize}–${h.maxTeamSize}`,
            },
          ].map(({ icon, text }) => (
            <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d={icon} />
              </svg>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Tags */}
        {h.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 18 }}>
            {h.tags.map(t => (
              <span key={t} style={{
                padding: '3px 9px', borderRadius: 7,
                fontSize: '0.65rem', fontWeight: 600,
                fontFamily: "'Fira Code', monospace",
                background: 'var(--bg-warm)', color: 'var(--text-soft)',
              }}>{t}</span>
            ))}
          </div>
        )}

        {/* Footer: interested count + register button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 500 }}>
            {h.interestedCount > 0 && `${h.interestedCount} interested`}
            {deadline && h.interestedCount > 0 && ' · '}
            {deadline && <span style={{ color: h.status === 'LIVE' ? 'var(--accent)' : 'var(--text-faint)' }}>{deadline}</span>}
          </span>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            disabled={isToggling || !isAuthenticated}
            onClick={() => onToggle(h.id)}
            style={{
              padding: '9px 20px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 700,
              border: isRegistered ? '1.5px solid var(--border-strong)' : 'none',
              cursor: isAuthenticated ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', flexShrink: 0,
              transition: 'opacity 0.2s',
              background: isRegistered
                ? 'transparent'
                : 'linear-gradient(135deg, var(--accent), var(--peach))',
              color: isRegistered ? 'var(--text-soft)' : 'white',
              opacity: isToggling ? 0.5 : 1,
              boxShadow: isRegistered ? 'none' : '0 4px 14px rgba(224,93,80,0.3)',
            }}
          >
            {isRegistered ? '✓ Registered' : 'Register'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Hackathons() {
  const { isAuthenticated } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [hackRes, interestRes] = await Promise.all([
          api.get('/api/v1/hackathons'),
          isAuthenticated
            ? api.get('/api/v1/hackathons/me/interests').catch(() => ({ data: { hackathonIds: [] } }))
            : Promise.resolve({ data: { hackathonIds: [] } }),
        ]);
        setHackathons(hackRes.data.hackathons || []);
        setRegisteredIds(new Set(interestRes.data.hackathonIds || []));
      } catch (err) {
        console.error('Failed to load hackathons:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  const toggleInterest = useCallback(async (id) => {
    if (!isAuthenticated) return;
    setTogglingId(id);
    try {
      const res = await api.post(`/api/v1/hackathons/${id}/interest`);
      setRegisteredIds((prev) => {
        const next = new Set(prev);
        if (res.data.registered) next.add(id); else next.delete(id);
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle interest:', err);
    } finally {
      setTogglingId(null);
    }
  }, [isAuthenticated]);

  const filtered = hackathons.filter((h) => {
    if (h.status === 'ENDED') return false;
    if (activeFilter === 'All Events') return true;
    if (activeFilter === 'Live Now') return h.status === 'LIVE';
    if (activeFilter === 'Open Registration') return h.status === 'OPEN';
    if (activeFilter === 'Coming Soon') return h.status === 'SOON';
    return true;
  });

  const liveCnt = hackathons.filter(h => h.status === 'LIVE').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      <div style={{ padding: '96px clamp(16px, 4vw, 40px) 80px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                Hackathons
              </h1>
              {liveCnt > 0 && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700,
                  background: 'rgba(224,93,80,0.12)', color: 'var(--accent)',
                  border: '1px solid rgba(224,93,80,0.25)',
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', animation: 'pulseDot 1.6s infinite' }} />
                  {liveCnt} live now
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
              Browse and register for upcoming hackathons across Singapore universities.
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 32, flexWrap: 'wrap',
          background: 'var(--bg-warm)', padding: 5, borderRadius: 14,
          width: 'fit-content',
        }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: 10, fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s ease',
                border: 'none', fontFamily: 'inherit',
                background: activeFilter === f ? 'var(--bg-card)' : 'transparent',
                color: activeFilter === f ? 'var(--text-dark)' : 'var(--text-soft)',
                boxShadow: activeFilter === f ? 'var(--shadow-soft)' : 'none',
              }}
            >{f}</button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 300, borderRadius: 20, background: 'var(--bg-card)',
                border: '1px solid var(--border)', overflow: 'hidden',
              }}>
                <div style={{ height: 6, background: 'var(--bg-warm)' }} />
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[80, 60, 120, 40].map((w, j) => (
                    <div key={j} style={{
                      height: j === 0 ? 20 : j === 2 ? 36 : 14,
                      width: `${w}%`, borderRadius: 6,
                      background: 'var(--bg-warm)',
                      animation: 'pulse 1.8s ease-in-out infinite',
                      animationDelay: `${j * 0.1}s`,
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0', color: 'var(--text-soft)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>🗓️</div>
            <p style={{ fontWeight: 700, fontSize: '1rem' }}>No events in this filter</p>
            <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Try selecting "All Events" to see everything</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}>
            {filtered.map((h, i) => (
              <HackathonCard
                key={h.id}
                h={h}
                idx={i}
                isRegistered={registeredIds.has(h.id)}
                isToggling={togglingId === h.id}
                onToggle={toggleInterest}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
