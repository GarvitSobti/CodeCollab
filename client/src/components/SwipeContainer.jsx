import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../contexts/ChatContext';
import User from '../models/User';

const rawProfiles = [
  { id: 'jamie', name: 'Jamie Tan', uni: 'NUS · CS Year 2', skills: ['React', 'TypeScript', 'Figma'], hackathons: 5, rating: 4.8, reviews: 12, match: 92, quote: 'Loves building pixel-perfect UIs. Always ships ahead of schedule.', gradient: 'linear-gradient(135deg,#ff6b6b,#ff8a65)', bannerGrad: 'linear-gradient(135deg,#ffe0d6,#ffd4cc,#ffeee8)', initials: 'JT', skillColors: [{bg:'rgba(255,107,107,0.1)',c:'#ff6b6b'},{bg:'rgba(66,165,245,0.1)',c:'#42a5f5'},{bg:'rgba(179,157,219,0.1)',c:'#b39ddb'}] },
  { id: 'weiming', name: 'Wei Ming Chen', uni: 'NTU · CE Year 3', skills: ['Python', 'TensorFlow', 'AWS'], hackathons: 8, rating: 4.9, reviews: 21, match: 88, quote: 'ML wizard who makes complex models feel simple. Great team player.', gradient: 'linear-gradient(135deg,#42a5f5,#1e88e5)', bannerGrad: 'linear-gradient(135deg,#d6eaff,#c8e0ff,#e0f0ff)', initials: 'WM', skillColors: [{bg:'rgba(66,165,245,0.1)',c:'#42a5f5'},{bg:'rgba(255,202,40,0.1)',c:'#f9a825'},{bg:'rgba(102,187,106,0.1)',c:'#66bb6a'}] },
  { id: 'priya', name: 'Priya Sharma', uni: 'SMU · IS Year 2', skills: ['Node.js', 'PostgreSQL', 'Docker'], hackathons: 3, rating: 4.7, reviews: 8, match: 95, quote: 'Backend powerhouse. Set up our entire API in one night at HackNUS.', gradient: 'linear-gradient(135deg,#b39ddb,#7e57c2)', bannerGrad: 'linear-gradient(135deg,#ece0ff,#e0d4f5,#f0e8ff)', initials: 'PS', skillColors: [{bg:'rgba(179,157,219,0.1)',c:'#b39ddb'},{bg:'rgba(66,165,245,0.1)',c:'#42a5f5'},{bg:'rgba(255,138,101,0.1)',c:'#ff8a65'}] },
  { id: 'alex', name: 'Alex Ng', uni: 'SUTD · EPD Year 3', skills: ['Flutter', 'Firebase', 'UI/UX'], hackathons: 6, rating: 4.6, reviews: 15, match: 84, quote: 'Cross-platform maestro. His mobile apps always win the design award.', gradient: 'linear-gradient(135deg,#66bb6a,#43a047)', bannerGrad: 'linear-gradient(135deg,#dcf5dd,#c8eeca,#e8f8e8)', initials: 'AN', skillColors: [{bg:'rgba(102,187,106,0.1)',c:'#66bb6a'},{bg:'rgba(255,202,40,0.1)',c:'#f9a825'},{bg:'rgba(240,98,146,0.1)',c:'#f06292'}] },
  { id: 'sarah', name: 'Sarah Lim', uni: 'NUS · CS Year 4', skills: ['Rust', 'Go', 'Systems'], hackathons: 11, rating: 5.0, reviews: 28, match: 90, quote: 'Senior dev energy. Mentored our whole team and we placed 1st.', gradient: 'linear-gradient(135deg,#ffca28,#ff8a65)', bannerGrad: 'linear-gradient(135deg,#fff5d6,#ffedcc,#fff8e0)', initials: 'SL', skillColors: [{bg:'rgba(255,202,40,0.1)',c:'#f9a825'},{bg:'rgba(255,107,107,0.1)',c:'#ff6b6b'},{bg:'rgba(66,165,245,0.1)',c:'#42a5f5'}] },
];

const profiles = rawProfiles.map((profile) => new User(profile));

function ProfileCard({ profile, onSwipeLeft, onSwipeRight }) {
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
      const passLabel = card.querySelector('.swipe-label-pass');
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
      const vel = velocityXRef.current;

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
      setTimeout(() => {
        if (dir === 'right') onSwipeRight();
        else onSwipeLeft();
      }, 300);
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
        borderRadius: 'var(--radius)', background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-heavy)', border: '1px solid rgba(0,0,0,0.04)',
        overflow: 'hidden', cursor: 'grab', userSelect: 'none',
        willChange: 'transform', touchAction: 'none',
      }}
    >
      <div className="swipe-label-connect" style={{
        position: 'absolute', top: 28, right: 20, padding: '10px 24px',
        borderRadius: 14, fontWeight: 800, fontSize: '1.2rem',
        background: 'rgba(102,187,106,0.12)', color: 'var(--mint)',
        border: '2.5px solid var(--mint)', transform: 'rotate(8deg)',
        opacity: 0, pointerEvents: 'none', zIndex: 10,
      }}>Connect ✨</div>
      <div className="swipe-label-pass" style={{
        position: 'absolute', top: 28, left: 20, padding: '10px 24px',
        borderRadius: 14, fontWeight: 800, fontSize: '1.2rem',
        background: 'rgba(255,107,107,0.12)', color: 'var(--coral)',
        border: '2.5px solid var(--coral)', transform: 'rotate(-8deg)',
        opacity: 0, pointerEvents: 'none', zIndex: 10,
      }}>Pass</div>

      <div style={{ height: 140, position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', background: profile.bannerGrad }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
          background: 'linear-gradient(to top, var(--bg-card), transparent)',
        }} />
        <div style={{
          position: 'absolute', top: 14, right: 14, padding: '5px 12px',
          borderRadius: 10, fontSize: '0.7rem', fontWeight: 700,
          fontFamily: "'Fira Code', monospace", background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)', color: 'var(--mint)',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--mint)',
            animation: 'pulseDot 1.8s infinite',
          }} />
          {profile.match}% match
        </div>
      </div>

      <div style={{ padding: '16px 22px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 15, background: profile.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.15rem', color: 'white', flexShrink: 0,
          }}>{profile.initials}</div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{profile.name}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', marginTop: 1 }}>{profile.uni}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {profile.skills.map((s, i) => (
            <span key={s} style={{
              padding: '4px 11px', borderRadius: 9, fontSize: '0.65rem',
              fontWeight: 600, fontFamily: "'Fira Code', monospace",
              background: profile.skillColors[i].bg, color: profile.skillColors[i].c,
            }}>{s}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {[
            { val: profile.hackathons, lbl: 'Hackathons' },
            { val: `★ ${profile.rating}`, lbl: 'Rating', color: '#f9a825' },
            { val: profile.reviews, lbl: 'Reviews' },
          ].map(({ val, lbl, color }) => (
            <div key={lbl} style={{
              textAlign: 'center', padding: '10px 6px', borderRadius: 12, background: 'var(--bg)',
            }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, display: 'block', color: color || 'inherit' }}>{val}</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</span>
            </div>
          ))}
        </div>

        <div style={{
          padding: '12px 14px', borderRadius: 12, background: 'var(--bg)',
          fontSize: '0.75rem', color: 'var(--text-body)', fontStyle: 'italic', lineHeight: 1.55,
          position: 'relative',
        }}>
          <span style={{
            position: 'absolute', top: -4, left: 10, fontSize: '1.8rem',
            fontStyle: 'normal', fontWeight: 800, color: 'var(--lavender)', opacity: 0.5,
          }}>"</span>
          {profile.quote}
        </div>
      </div>
    </div>
  );
}

// ─── Match Modal ──────────────────────────────────────────────────────────────
function MatchModal({ profile, onMessage, onClose }) {
  return (
    <div style={{
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
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🎉</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
          It's a Match!
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', marginBottom: 24, lineHeight: 1.6 }}>
          You and <strong>{profile.name}</strong> both want to collaborate.<br />
          Say hello and start building together!
        </p>

        {/* Avatars */}
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
            width: 60, height: 60, borderRadius: 18,
            background: profile.gradient,
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
              boxShadow: '0 4px 14px rgba(255,107,107,0.3)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            💬 Message {profile.name.split(' ')[0]}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 0', borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.08)',
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

export default function SwipeContainer() {
  const [idx, setIdx] = useState(0);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const navigate = useNavigate();
  const { openOrCreateDM } = useChatContext();

  const advance = () => setIdx(i => (i + 1) >= profiles.length ? 0 : i + 1);

  const handleSwipeRight = () => {
    const currentProfile = profiles[idx];
    advance();
    // Show match modal (simulate mutual match)
    setMatchedProfile(currentProfile);
  };

  const handleMessage = async () => {
    if (!matchedProfile) return;
    await openOrCreateDM(matchedProfile.id);
    setMatchedProfile(null);
    navigate('/messages');
  };

  const visible = profiles.slice(idx, idx + 3).length < 3
    ? [...profiles.slice(idx), ...profiles.slice(0, 3 - profiles.slice(idx).length)]
    : profiles.slice(idx, idx + 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {matchedProfile && (
        <MatchModal
          profile={matchedProfile}
          onMessage={handleMessage}
          onClose={() => setMatchedProfile(null)}
        />
      )}
      <div style={{ position: 'relative', width: 380, height: 520, marginBottom: 28 }}>
        {[...visible].reverse().map((p, i) => {
          const isTop = i === visible.length - 1;
          const scale = 1 - (visible.length - 1 - i) * 0.05;
          const translateY = (visible.length - 1 - i) * 12;
          const opacity = i === 0 ? 0.2 : i === 1 ? 0.5 : 1;
          return (
            <div key={p.name + i} style={{
              position: 'absolute', width: '100%', height: '100%',
              transform: isTop ? undefined : `scale(${scale}) translateY(${translateY}px)`,
              opacity, zIndex: i,
              filter: isTop ? 'none' : 'blur(1px)',
              pointerEvents: isTop ? 'auto' : 'none',
            }}>
              {isTop && (
                <ProfileCard
                  profile={p}
                  onSwipeLeft={advance}
                  onSwipeRight={handleSwipeRight}
                />
              )}
              {!isTop && (
                <div style={{
                  width: '100%', height: '100%', borderRadius: 'var(--radius)',
                  background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)',
                  border: '1px solid rgba(0,0,0,0.04)',
                }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <button
          onClick={advance}
          style={{
            width: 54, height: 54, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.06)',
            background: 'var(--bg-card)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)',
            boxShadow: 'var(--shadow-soft)', transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--coral)'; e.currentTarget.style.color = 'var(--coral)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = 'var(--text-soft)'; }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button
          style={{
            width: 54, height: 54, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.06)',
            background: 'var(--bg-card)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)',
            boxShadow: 'var(--shadow-soft)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--honey)'; e.currentTarget.style.color = 'var(--honey)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = 'var(--text-soft)'; }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
        <button
          onClick={handleSwipeRight}
          style={{
            width: 64, height: 64, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg, var(--mint), #43a047)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 6px 24px rgba(102,187,106,0.35)',
            transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
