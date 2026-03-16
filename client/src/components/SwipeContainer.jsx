import React, { useState, useRef, useEffect } from 'react';

const profiles = [
  { name: 'Jamie Tan', uni: 'NUS · CS Year 2', skills: ['React', 'TypeScript', 'Figma'], hackathons: 5, rating: 4.8, reviews: 12, match: 92, quote: 'Loves building pixel-perfect UIs. Always ships ahead of schedule.', gradient: 'linear-gradient(135deg,#ff6b6b,#ff8a65)', bannerGrad: 'linear-gradient(135deg,#ffe0d6,#ffd4cc,#ffeee8)', initials: 'JT' },
  { name: 'Wei Ming Chen', uni: 'NTU · CE Year 3', skills: ['Python', 'TensorFlow', 'AWS'], hackathons: 8, rating: 4.9, reviews: 21, match: 88, quote: 'ML wizard who makes complex models feel simple. Great team player.', gradient: 'linear-gradient(135deg,#42a5f5,#1e88e5)', bannerGrad: 'linear-gradient(135deg,#d6eaff,#c8e0ff,#e0f0ff)', initials: 'WM' },
  { name: 'Priya Sharma', uni: 'SMU · IS Year 2', skills: ['Node.js', 'PostgreSQL', 'Docker'], hackathons: 3, rating: 4.7, reviews: 8, match: 95, quote: 'Backend powerhouse. Set up our entire API in one night at HackNUS.', gradient: 'linear-gradient(135deg,#b39ddb,#7e57c2)', bannerGrad: 'linear-gradient(135deg,#ece0ff,#e0d4f5,#f0e8ff)', initials: 'PS' },
  { name: 'Alex Ng', uni: 'SUTD · EPD Year 3', skills: ['Flutter', 'Firebase', 'UI/UX'], hackathons: 6, rating: 4.6, reviews: 15, match: 84, quote: 'Cross-platform maestro. His mobile apps always win the design award.', gradient: 'linear-gradient(135deg,#66bb6a,#43a047)', bannerGrad: 'linear-gradient(135deg,#dcf5dd,#c8eeca,#e8f8e8)', initials: 'AN' },
  { name: 'Sarah Lim', uni: 'NUS · CS Year 4', skills: ['Rust', 'Go', 'Systems'], hackathons: 11, rating: 5.0, reviews: 28, match: 90, quote: 'Senior dev energy. Mentored our whole team and we placed 1st.', gradient: 'linear-gradient(135deg,#ffca28,#ff8a65)', bannerGrad: 'linear-gradient(135deg,#fff5d6,#ffedcc,#fff8e0)', initials: 'SL' },
];

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

  const bannerHeight = '30%';

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute', width: '100%', height: '100%',
        borderRadius: 20, background: 'var(--bg-card)',
        boxShadow: 'var(--shadow-heavy)',
        border: '1px solid var(--border)',
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
      <div style={{ height: bannerHeight, minHeight: 120, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: '100%', height: '100%', background: profile.gradient, opacity: 0.55 }} />
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
          <div style={{
            width: 60, height: 60, borderRadius: 16, background: profile.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.3rem', color: 'white', flexShrink: 0,
          }}>{profile.initials}</div>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{profile.name}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginTop: 2 }}>{profile.uni}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {profile.skills.map((s) => (
            <span key={s} style={{
              padding: '5px 14px', borderRadius: 10, fontSize: '0.75rem',
              fontWeight: 600, fontFamily: "'Fira Code', monospace",
              background: 'var(--bg-warm)', color: 'var(--text-body)',
            }}>{s}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { val: profile.hackathons, lbl: 'Hackathons' },
            { val: profile.rating, lbl: 'Rating' },
            { val: profile.reviews, lbl: 'Reviews' },
          ].map(({ val, lbl }) => (
            <div key={lbl} style={{
              textAlign: 'center', padding: '14px 8px', borderRadius: 14, background: 'var(--bg)',
            }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, display: 'block' }}>{val}</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lbl}</span>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
}

export default function SwipeContainer() {
  const [idx, setIdx] = useState(0);

  const advance = () => setIdx(i => (i + 1) >= profiles.length ? 0 : i + 1);

  const visible = profiles.slice(idx, idx + 3).length < 3
    ? [...profiles.slice(idx), ...profiles.slice(0, 3 - profiles.slice(idx).length)]
    : profiles.slice(idx, idx + 3);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%',
      height: '100%',
      maxHeight: 'calc(100vh - 72px)',
      padding: '20px 20px 24px',
    }}>
      <div style={{
        position: 'relative',
        width: 'min(500px, 92vw)',
        flex: 1,
        maxHeight: 700,
        marginBottom: 24,
      }}>
        {[...visible].reverse().map((p, i) => {
          const isTop = i === visible.length - 1;
          const scale = 1 - (visible.length - 1 - i) * 0.04;
          const translateY = (visible.length - 1 - i) * 10;
          const opacity = i === 0 ? 0.15 : i === 1 ? 0.4 : 1;
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
                  onSwipeRight={advance}
                />
              )}
              {!isTop && (
                <div style={{
                  width: '100%', height: '100%', borderRadius: 20,
                  background: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--border)',
                }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
        <button
          onClick={advance}
          style={{
            width: 54, height: 54, borderRadius: '50%', border: '2px solid var(--border)',
            background: 'var(--bg-card)', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'var(--text-soft)',
            boxShadow: 'var(--shadow-soft)', transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-soft)'; e.currentTarget.style.color = 'var(--text-dark)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-soft)'; }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <button
          onClick={advance}
          style={{
            width: 64, height: 64, borderRadius: '50%', border: 'none',
            background: 'var(--accent)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: 'var(--shadow-card)',
            transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
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
