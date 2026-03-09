import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Discover', path: '/discover' },
  { label: 'Hackathons', path: '/hackathons' },
  { label: 'My Team', path: '/team' },
  { label: 'Messages', path: '/messages' },
  { label: 'Profile', path: '/profile' },
];

const petalColors = ['var(--peach)', 'var(--coral)', 'var(--lavender)', 'var(--mint)', 'var(--sky)'];
const petalAngles = [270, 342, 54, 126, 198];

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 72,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 40px', zIndex: 100,
      background: 'rgba(250, 247, 242, 0.85)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
    }}>
      <div
        onClick={() => navigate('/discover')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        <div style={{ width: 36, height: 36, position: 'relative' }}>
          {petalColors.map((bg, i) => {
            const r = 10;
            const angle = (petalAngles[i] * Math.PI) / 180;
            const x = 50 + r * Math.cos(angle);
            const y = 50 + r * Math.sin(angle);
            return (
              <div key={i} style={{
                position: 'absolute', width: 12, height: 12, borderRadius: '50%',
                background: bg, top: `${y}%`, left: `${x}%`,
                transform: 'translate(-50%,-50%)',
              }} />
            );
          })}
          <div style={{
            position: 'absolute', width: 9, height: 9, borderRadius: '50%',
            background: 'var(--honey)', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)', zIndex: 2,
          }} />
        </div>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-dark)' }}>
          CodeCollab
        </h1>
      </div>

      <div className="nav-links" style={{
        display: 'flex', gap: 4, background: 'var(--bg-warm)', padding: 4, borderRadius: 14,
      }}>
        {navLinks.map(({ label, path }) => {
          const active = location.pathname === path;
          return (
            <span
              key={path}
              onClick={() => navigate(path)}
              style={{
                fontSize: '0.8rem', fontWeight: 600, padding: '8px 18px', borderRadius: 10,
                cursor: 'pointer', transition: 'all 0.3s',
                color: active ? 'var(--text-dark)' : 'var(--text-soft)',
                background: active ? 'var(--bg-card)' : 'transparent',
                boxShadow: active ? 'var(--shadow-soft)' : 'none',
              }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={{
          width: 38, height: 38, borderRadius: 12, background: 'var(--bg-card)',
          border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', position: 'relative', color: 'var(--text-soft)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <div style={{
            position: 'absolute', top: 7, right: 7, width: 7, height: 7,
            borderRadius: '50%', background: 'var(--coral)',
          }} />
        </button>
        <div
          onClick={() => navigate('/profile')}
          style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--peach), var(--coral))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.75rem', color: 'white', cursor: 'pointer',
          }}
        >
          EH
        </div>
      </div>
    </nav>
  );
}
