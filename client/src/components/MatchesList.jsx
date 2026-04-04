import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useChatContext } from '../contexts/ChatContext';

const GRADIENTS = [
  'linear-gradient(135deg,#ff6b6b,#ff8a65)',
  'linear-gradient(135deg,#42a5f5,#1e88e5)',
  'linear-gradient(135deg,#b39ddb,#7e57c2)',
  'linear-gradient(135deg,#66bb6a,#43a047)',
  'linear-gradient(135deg,#ffca28,#ff8a65)',
  'linear-gradient(135deg,#f06292,#e91e63)',
  'linear-gradient(135deg,#4dd0e1,#0097a7)',
];

const SKILL_COLORS = [
  { bg: 'rgba(255,138,101,0.12)', color: 'var(--peach)' },
  { bg: 'rgba(66,165,245,0.12)', color: 'var(--sky)' },
  { bg: 'rgba(179,157,219,0.12)', color: 'var(--lavender)' },
  { bg: 'rgba(102,187,106,0.12)', color: 'var(--mint)' },
];

function gradientFor(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '??';
}

function tierInfo(tier) {
  if (tier === 'ADVANCED') return { label: 'Advanced', color: 'var(--accent)', bg: 'rgba(224,93,80,0.1)' };
  if (tier === 'INTERMEDIATE') return { label: 'Intermediate', color: 'var(--sky)', bg: 'rgba(66,165,245,0.1)' };
  return { label: 'Beginner', color: 'var(--text-soft)', bg: 'rgba(128,128,128,0.08)' };
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MatchCard({ match, onMessage, index }) {
  const { user, matchedAt } = match;
  const gradient = gradientFor(user.firebaseUid || user.id);
  const skills = Array.isArray(user.profile?.skills)
    ? user.profile.skills.map((s) => s.name).filter(Boolean)
    : [];
  const tier = tierInfo(user.profile?.internalSkillTier);
  const hackathons = user.profile?.hackathonExperienceCount ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 26 }}
      style={{
        borderRadius: 18, background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-soft)',
        padding: '16px',
        display: 'flex', gap: 14, alignItems: 'flex-start',
        borderLeft: '3px solid transparent',
        backgroundImage: 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient tint in corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 120, height: 120,
        background: `radial-gradient(circle at top right, ${gradient.split(',')[1]?.replace(')', '').trim() || '#ff8a65'}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Avatar */}
      <div style={{ flexShrink: 0 }}>
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            style={{
              width: 60, height: 60, borderRadius: 16, objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
        ) : (
          <div style={{
            width: 60, height: 60, borderRadius: 16, background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.1rem', color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>
            {getInitials(user.name)}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: '0.97rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-dark)', lineHeight: 1 }}>
            {user.name}
          </span>
          <span style={{
            padding: '2px 8px', borderRadius: 6, fontSize: '0.6rem', fontWeight: 700,
            background: tier.bg, color: tier.color,
          }}>
            {tier.label}
          </span>
        </div>

        {/* University */}
        {user.university && (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)', margin: '0 0 8px', fontWeight: 500 }}>
            {user.university}
          </p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {skills.slice(0, 4).map((s, i) => (
              <span key={s} style={{
                padding: '3px 8px', borderRadius: 6, fontSize: '0.62rem', fontWeight: 600,
                fontFamily: "'Fira Code', monospace",
                background: SKILL_COLORS[i % SKILL_COLORS.length].bg,
                color: SKILL_COLORS[i % SKILL_COLORS.length].color,
              }}>{s}</span>
            ))}
            {skills.length > 4 && (
              <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.62rem', color: 'var(--text-faint)', background: 'var(--bg-warm)' }}>
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Hackathon count */}
            <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--lavender)" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              {hackathons} {hackathons === 1 ? 'hackathon' : 'hackathons'}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>· {timeAgo(matchedAt)}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onMessage(user)}
            style={{
              padding: '7px 16px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, var(--accent), var(--peach))',
              color: 'white', fontFamily: 'inherit', fontSize: '0.76rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 3px 10px rgba(224,93,80,0.28)',
              display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Message
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MatchesList({ onUnreadCount }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { openOrCreateDM } = useChatContext();

  const fetchMatches = useCallback(async () => {
    try {
      const { data } = await api.get('/api/v1/discover/matches');
      setMatches(data.matches || []);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    api.patch('/api/v1/notifications/read-all').catch(() => {});
    onUnreadCount?.(0);
  }, [fetchMatches, onUnreadCount]);

  const handleMessage = async (user) => {
    await openOrCreateDM(user.firebaseUid);
    navigate('/messages');
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2].map((i) => (
          <div key={i} style={{
            borderRadius: 18, background: 'var(--bg-card)', border: '1px solid var(--border)',
            height: 100, animation: 'pulse 1.8s ease-in-out infinite',
          }} />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: 320, textAlign: 'center', gap: 14,
      }}>
        <div style={{ fontSize: '3rem' }}>💫</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>No matches yet</h3>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.83rem', margin: 0, maxWidth: 260, lineHeight: 1.65 }}>
          When someone swipes right on you and you swipe right back, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Your Matches</h2>
        <span style={{
          padding: '2px 9px', borderRadius: 7, fontSize: '0.7rem', fontWeight: 700,
          background: 'rgba(224,93,80,0.1)', color: 'var(--accent)',
        }}>{matches.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {matches.map((match, i) => (
          <MatchCard key={match.matchId} match={match} onMessage={handleMessage} index={i} />
        ))}
      </div>
    </div>
  );
}
