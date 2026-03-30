import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../contexts/ChatContext';
import api from '../services/api';
import User from '../models/User';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function profileToUser(p) {
  const skills = Array.isArray(p.profile?.skills)
    ? p.profile.skills.map((s) => s.name).filter(Boolean)
    : [];
  const hackathons = p.profile?.hackathonExperienceCount ?? 0;
  const tier = p.profile?.internalSkillTier ?? 'BEGINNER';
  const tierLabel = tier === 'ADVANCED' ? 'Advanced' : tier === 'INTERMEDIATE' ? 'Intermediate' : 'Beginner';

  return new User({
    id: p.id,
    name: p.name || 'Unknown',
    email: p.email || '',
    avatarUrl: p.avatarUrl || p.profile?.photoDataUrl || null,
    uni: [p.university, p.profile?.major].filter(Boolean).join(' · '),
    skills,
    hackathons,
    tier: tierLabel,
    match: p.compatibilityScore ?? 0,
    quote: p.bio || '',
  });
}

// Deterministic gradient per user id
const GRADIENTS = [
  'linear-gradient(135deg,#ff6b6b,#ff8a65)',
  'linear-gradient(135deg,#42a5f5,#1e88e5)',
  'linear-gradient(135deg,#b39ddb,#7e57c2)',
  'linear-gradient(135deg,#66bb6a,#43a047)',
  'linear-gradient(135deg,#ffca28,#ff8a65)',
  'linear-gradient(135deg,#f06292,#e91e63)',
  'linear-gradient(135deg,#4dd0e1,#0097a7)',
];
function gradientFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

// ─── ProfileCard ──────────────────────────────────────────────────────────────

function ProfileCard({ profile, gradient, onSwipeLeft, onSwipeRight }) {
  const cardRef = useRef(null);
  const startXRef = useRef(0);
  const curXRef = useRef(0);
  const grabYRef = useRef(0);
  const draggingRef = useRef(false);
  const velocityXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onStart = (e) => {
      draggingRef.current = true;
      const point = e.touches ? e.touches[0] : e;
      startXRef.current = point.clientX;
      lastXRef.current = point.clientX;
      lastTimeRef.current = Date.now();
      const rect = card.getBoundingClientRect();
      grabYRef.current = (point.clientY - rect.top) / rect.height - 0.5;
      card.style.transition = 'none';
      if (e.cancelable) e.preventDefault();
    };

    const onMove = (e) => {
      if (!draggingRef.current) return;
      const point = e.touches ? e.touches[0] : e;
      curXRef.current = point.clientX - startXRef.current;
      const now = Date.now();
      const dt = now - lastTimeRef.current;
      if (dt > 0) {
        velocityXRef.current = (point.clientX - lastXRef.current) / dt * 1000;
        lastXRef.current = point.clientX;
        lastTimeRef.current = now;
      }
      const rotation = curXRef.current * (-grabYRef.current * 0.15 + 0.05);
      card.style.transform = `translateX(${curXRef.current}px) rotate(${rotation}deg)`;

      const connectLabel = card.querySelector('.swipe-label-connect');
      const passLabel    = card.querySelector('.swipe-label-pass');
      if (curXRef.current > 30) {
        connectLabel.style.opacity = Math.min((curXRef.current - 30) / 70, 1);
        passLabel.style.opacity = 0;
      } else if (curXRef.current < -30) {
        passLabel.style.opacity = Math.min((-curXRef.current - 30) / 70, 1);
        connectLabel.style.opacity = 0;
      } else {
        connectLabel.style.opacity = 0;
        passLabel.style.opacity = 0;
      }
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const curX = curXRef.current;
      const vel  = velocityXRef.current;
      if (curX > 90 || (curX > 30 && vel > 600)) {
        throwCard('right');
      } else if (curX < -90 || (curX < -30 && vel < -600)) {
        throwCard('left');
      } else {
        card.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = 'scale(1) translateY(0)';
        card.querySelector('.swipe-label-connect').style.opacity = 0;
        card.querySelector('.swipe-label-pass').style.opacity = 0;
      }
      curXRef.current = 0;
      velocityXRef.current = 0;
    };

    const throwCard = (dir) => {
      const distance = dir === 'right' ? '160%' : '-160%';
      card.style.transition = 'transform 0.35s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.35s ease';
      card.style.transform = `translateX(${distance}) rotate(${dir === 'right' ? '22' : '-22'}deg)`;
      card.style.opacity = '0';
      setTimeout(() => { dir === 'right' ? onSwipeRight() : onSwipeLeft(); }, 300);
    };

    card.addEventListener('mousedown', onStart);
    card.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
    card._throwCard = throwCard;

    return () => {
      card.removeEventListener('mousedown', onStart);
      card.removeEventListener('touchstart', onStart);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
    };
  }, [onSwipeLeft, onSwipeRight]);

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute', width: '100%', height: '100%',
        borderRadius: 20, background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-heavy)', border: '1px solid var(--border)',
        overflow: 'hidden', cursor: 'grab', userSelect: 'none',
        willChange: 'transform', touchAction: 'none',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div className="swipe-label-connect" style={{
        position: 'absolute', top: 28, right: 20, padding: '10px 24px',
        borderRadius: 14, fontWeight: 800, fontSize: '1.2rem',
        background: 'var(--bg-card)', color: 'var(--accent)',
        border: '2.5px solid var(--accent)', transform: 'rotate(8deg)',
        opacity: 0, pointerEvents: 'none', zIndex: 10,
      }}>Connect</div>
      <div className="swipe-label-pass" style={{
        position: 'absolute', top: 28, left: 20, padding: '10px 24px',
        borderRadius: 14, fontWeight: 800, fontSize: '1.2rem',
        background: 'var(--bg-card)', color: 'var(--text-soft)',
        border: '2.5px solid var(--text-soft)', transform: 'rotate(-8deg)',
        opacity: 0, pointerEvents: 'none', zIndex: 10,
      }}>Pass</div>

      {/* Banner */}
      <div style={{ height: '30%', minHeight: 120, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: '100%', height: '100%', background: gradient, opacity: 0.55 }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to top, var(--bg-card), transparent)',
        }} />
        <div style={{
          position: 'absolute', top: 16, right: 16, padding: '6px 14px',
          borderRadius: 10, fontSize: '0.8rem', fontWeight: 700,
          fontFamily: "'Fira Code', monospace", background: 'var(--bg-card)',
          color: 'var(--accent)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)',
            animation: 'pulseDot 1.8s infinite',
          }} />
          {profile.match}% match
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              style={{ width: 60, height: 60, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 60, height: 60, borderRadius: 16, background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.3rem', color: 'white', flexShrink: 0,
            }}>{profile.initials}</div>
          )}
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{profile.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginTop: 2 }}>{profile.uni}</p>
          </div>
        </div>

        {profile.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {profile.skills.slice(0, 6).map((s) => (
              <span key={s} style={{
                padding: '5px 14px', borderRadius: 10, fontSize: '0.75rem',
                fontWeight: 600, fontFamily: "'Fira Code', monospace",
                background: 'var(--bg-warm)', color: 'var(--text-body)',
              }}>{s}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { val: profile.hackathons, lbl: 'Hackathons' },
            { val: profile.tier, lbl: 'Skill Level' },
          ].map(({ val, lbl }) => (
            <div key={lbl} style={{
              textAlign: 'center', padding: '14px 8px', borderRadius: 14, background: 'var(--bg)',
            }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, display: 'block' }}>{val}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</span>
            </div>
          ))}
        </div>

        {profile.quote && (
          <div style={{
            padding: '16px 18px', borderRadius: 14, background: 'var(--bg)',
            fontSize: '0.85rem', color: 'var(--text-body)', fontStyle: 'italic', lineHeight: 1.6,
            position: 'relative', flex: 1, display: 'flex', alignItems: 'center',
          }}>
            <span style={{
              position: 'absolute', top: -2, left: 12, fontSize: '2rem',
              fontStyle: 'normal', fontWeight: 800, color: 'var(--accent)', opacity: 0.2,
            }}>"</span>
            <span style={{ paddingLeft: 4 }}>{profile.quote}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Match Modal ──────────────────────────────────────────────────────────────

function MatchModal({ profile, gradient, onMessage, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)',
          padding: '40px 36px', textAlign: 'center', maxWidth: 360, width: '90%',
          boxShadow: 'var(--shadow-heavy)', animation: 'scaleIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
          It's a Match!
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: 24, lineHeight: 1.6 }}>
          You and <strong>{profile.name}</strong> both want to collaborate.<br />
          Say hello and start building together!
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--peach), var(--coral))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.1rem', color: 'white',
            border: '3px solid var(--bg-card)', boxShadow: 'var(--shadow-soft)',
          }}>YO</div>
          <div style={{ fontSize: '1.4rem' }}>💬</div>
          <div style={{
            width: 60, height: 60, borderRadius: 18, background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.1rem', color: 'white',
            border: '3px solid var(--bg-card)', boxShadow: 'var(--shadow-soft)',
          }}>{profile.initials}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onMessage}
            style={{
              padding: '13px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--peach), var(--coral))',
              color: 'white', fontFamily: 'inherit', fontSize: '0.88rem', fontWeight: 700,
              boxShadow: '0 4px 14px rgba(255,107,107,0.3)', transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Message {profile.name.split(' ')[0]}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 0', borderRadius: 14, border: '1.5px solid var(--border)',
              cursor: 'pointer', background: 'var(--bg)', color: 'var(--text-soft)',
              fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
            }}
          >
            Keep Swiping
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onRefresh, loading }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', gap: 16, textAlign: 'center', padding: 32,
    }}>
      <div style={{ fontSize: '3rem' }}>👀</div>
      <h3 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>No more profiles</h3>
      <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', margin: 0, maxWidth: 260, lineHeight: 1.6 }}>
        You've seen everyone for now. Check back later or refresh to see new people.
      </p>
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          padding: '10px 24px', borderRadius: 12, border: 'none',
          background: 'var(--accent)', color: 'white',
          fontFamily: 'inherit', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Loading…' : 'Refresh'}
      </button>
    </div>
  );
}

// ─── SwipeContainer ───────────────────────────────────────────────────────────

export default function SwipeContainer() {
  const [profiles, setProfiles] = useState([]);
  const [idx, setIdx] = useState(0);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { openOrCreateDM } = useChatContext();

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/v1/discover');
      setProfiles((data.profiles || []).map(profileToUser));
      setIdx(0);
    } catch (err) {
      setError('Failed to load profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  // profile is passed in directly — no dependency on profiles/idx state
  const recordSwipe = useCallback(async (profile, direction) => {
    try {
      const { data } = await api.post('/api/v1/discover/swipe', { targetId: profile.id, direction });
      if (data.matched) setMatchedProfile(profile);
    } catch {
      // Swipe recording failure is non-fatal — user experience continues
    }
  }, []);

  const advance = useCallback(() => setIdx((i) => i + 1), []);

  const handleSwipeLeft = useCallback(() => {
    const current = profiles[idx];
    if (current) recordSwipe(current, 'left');
    advance();
  }, [profiles, idx, recordSwipe, advance]);

  const handleSwipeRight = useCallback(() => {
    const current = profiles[idx];
    if (current) recordSwipe(current, 'right');
    advance();
  }, [profiles, idx, recordSwipe, advance]);

  const handleMessage = async () => {
    if (!matchedProfile) return;
    await openOrCreateDM(matchedProfile.id);
    setMatchedProfile(null);
    navigate('/messages');
  };

  const hasMore = idx < profiles.length;

  // Visible stack: top card + 2 ghost cards behind it
  const visible = hasMore ? profiles.slice(idx, idx + 3) : [];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%', height: '100%',
      maxHeight: 'calc(100vh - 72px)',
      padding: '20px 20px 24px',
    }}>
      {matchedProfile && (
        <MatchModal
          profile={matchedProfile}
          gradient={gradientFor(matchedProfile.id)}
          onMessage={handleMessage}
          onClose={() => setMatchedProfile(null)}
        />
      )}

      <div style={{
        position: 'relative', width: 'min(500px, 92vw)',
        flex: 1, maxHeight: 700, marginBottom: 24,
      }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            borderRadius: 20, background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}>
            <p style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Finding your matches…</p>
          </div>
        )}

        {!loading && error && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)',
            padding: 32, textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>{error}</p>
            <button onClick={fetchProfiles} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'var(--accent)', color: 'white',
              fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer',
            }}>Retry</button>
          </div>
        )}

        {!loading && !error && !hasMore && (
          <EmptyState onRefresh={fetchProfiles} loading={loading} />
        )}

        {!loading && !error && hasMore && [...visible].reverse().map((p, i) => {
          const isTop = i === visible.length - 1;
          const scale = 1 - (visible.length - 1 - i) * 0.04;
          const translateY = (visible.length - 1 - i) * 10;
          const opacity = i === 0 ? 0.15 : i === 1 ? 0.4 : 1;
          const grad = gradientFor(p.id);

          return (
            <div key={p.id + i} style={{
              position: 'absolute', width: '100%', height: '100%',
              transform: isTop ? undefined : `scale(${scale}) translateY(${translateY}px)`,
              opacity, zIndex: i,
              filter: isTop ? 'none' : 'blur(1px)',
              pointerEvents: isTop ? 'auto' : 'none',
            }}>
              {isTop ? (
                <ProfileCard
                  profile={p}
                  gradient={grad}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%', borderRadius: 20,
                  background: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-card)', border: '1px solid var(--border)',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {hasMore && !loading && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={handleSwipeLeft}
            style={{
              width: 54, height: 54, borderRadius: '50%', border: '2px solid var(--border)',
              background: 'var(--bg-card)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)',
              boxShadow: 'var(--shadow-soft)', transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-soft)'; e.currentTarget.style.color = 'var(--text-dark)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-soft)'; }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <button
            onClick={handleSwipeRight}
            style={{
              width: 64, height: 64, borderRadius: '50%', border: 'none',
              background: 'var(--accent)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'white', boxShadow: 'var(--shadow-card)',
              transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
