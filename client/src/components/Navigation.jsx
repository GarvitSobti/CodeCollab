import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BrandFlower from './BrandFlower';
import { useTheme } from '../contexts/ThemeContext';

const navLinks = [
  { label: 'Discover', path: '/discover' },
  { label: 'Hackathons', path: '/hackathons' },
  { label: 'My Team', path: '/team' },
  { label: 'Messages', path: '/messages' },
  { label: 'Profile', path: '/profile' },
];

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="main-nav"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(12px, 3vw, 40px)', gap: 12, zIndex: 100,
        background: 'var(--bg)',
        boxShadow: scrolled ? 'var(--shadow-soft)' : 'none',
        transition: 'box-shadow 0.25s ease',
      }}
    >
      <a
        href="/discover"
        onClick={(e) => { e.preventDefault(); navigate('/discover'); }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}
        aria-label="CodeCollab home"
      >
        <BrandFlower />
        <span className="brand-name" style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-dark)' }}>
          CodeCollab
        </span>
      </a>

      <div className="nav-links" role="navigation" aria-label="Main navigation" style={{
        display: 'flex', gap: 4, background: 'var(--bg-warm)', padding: 4, borderRadius: 14,
      }}>
        {navLinks.map(({ label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-current={active ? 'page' : undefined}
              className={`nav-link${path === '/profile' ? ' nav-link-profile' : ''}`}
              style={{
                fontSize: '0.8rem', fontWeight: 600, padding: '8px 18px', borderRadius: 10, whiteSpace: 'nowrap',
                cursor: 'pointer', transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
                color: active ? 'var(--text-dark)' : 'var(--text-soft)',
                background: active ? 'var(--bg-card)' : 'transparent',
                boxShadow: active ? 'var(--shadow-soft)' : 'none',
                border: 'none', fontFamily: 'inherit',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="nav-right" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button
          aria-label="Notifications — new"
          className="nav-icon-btn"
          style={{
            width: 38, height: 38, borderRadius: 12, background: 'var(--bg-card)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', position: 'relative', color: 'var(--text-soft)',
            transition: 'border-color 0.2s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span style={{
            position: 'absolute', top: 7, right: 7, width: 7, height: 7,
            borderRadius: '50%', background: 'var(--accent)',
          }} aria-hidden="true" />
        </button>
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="nav-icon-btn"
          style={{
            width: 38, height: 38, borderRadius: 12, background: 'var(--bg-card)',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'var(--text-soft)',
            transition: 'border-color 0.2s ease',
          }}
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        <button
          onClick={() => navigate('/profile')}
          aria-label="Your profile"
          className="nav-icon-btn"
          style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.75rem', color: 'white', cursor: 'pointer',
            border: 'none', fontFamily: 'inherit',
            transition: 'opacity 0.2s ease',
          }}
        >
          EH
        </button>
      </div>
    </nav>
  );
}
