import React, { useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';
import SwipeContainer from '../components/SwipeContainer';

const hackathonPreviews = [
  { emoji: '🚀', name: 'SMU .Hack 2025', details: 'Feb 14-16 · 120 people · $10K prize', status: 'LIVE', statusStyle: { background: 'rgba(255,107,107,0.12)', color: 'var(--coral)' } },
  { emoji: '🧠', name: 'HackNUS 2025', details: 'Mar 1-3 · 89 people · $8K prize', status: 'OPEN', statusStyle: { background: 'rgba(102,187,106,0.12)', color: 'var(--mint)' } },
  { emoji: '🤖', name: 'NTU AI Challenge', details: 'Mar 15-17 · 56 people · $15K prize', status: 'SOON', statusStyle: { background: 'rgba(66,165,245,0.12)', color: 'var(--sky)' } },
  { emoji: '🎮', name: 'SUTD GameJam', details: 'Apr 5-6 · 34 people · $5K prize', status: 'SOON', statusStyle: { background: 'rgba(66,165,245,0.12)', color: 'var(--sky)' } },
];

const chatMessages = [
  { initials: 'JT', gradient: 'linear-gradient(135deg,var(--coral),var(--peach))', text: 'Hey team! Found a great API for hackathon data we could use 🚀', self: false },
  { initials: 'EH', gradient: 'linear-gradient(135deg,var(--sky),var(--lavender))', text: "Awesome! I'll handle the backend integration", self: true },
  { initials: 'PS', gradient: 'linear-gradient(135deg,var(--lavender),var(--rose))', text: 'Database schema is ready! PostgreSQL configured 💪', self: false },
  { initials: 'WM', gradient: 'linear-gradient(135deg,var(--mint),#00897b)', text: 'ML matching model hit 89% accuracy this morning 🧠', self: false },
];

export default function Discover() {
  const revealRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
        <div className="mesh-blob blob-4" />
        <div className="mesh-blob blob-5" />
      </div>
      <div className="noise" />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1300, margin: '0 auto' }}>

        {/* Hero */}
        <div className="stagger" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px',
            borderRadius: 20, background: 'linear-gradient(135deg, rgba(255,138,101,0.15), rgba(179,157,219,0.15))',
            fontSize: '0.75rem', fontWeight: 600, color: 'var(--peach)', marginBottom: 16,
          }}>
            🌸 New: 5 collaborators matched today
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
            Find people who<br />
            <span className="flowing-text">make ideas bloom</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Connect with talented students, discover hackathons you'll love, and build teams that bring out the best in everyone.
          </p>
        </div>

        {/* Swipe section */}
        <div className="stagger d1" style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Recommended for you</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 6 }}>
              ← swipe or drag →
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px 0' }}>
            <SwipeContainer />
          </div>
        </div>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Hackathons panel */}
          <div
            className="scroll-reveal"
            ref={el => revealRefs.current[0] = el}
            style={{ padding: 28, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎯 Hackathons Near You
            </div>
            {hackathonPreviews.map((h) => (
              <div key={h.name} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                borderRadius: 16, marginBottom: 8, background: 'var(--bg)', cursor: 'pointer',
                transition: 'transform 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', background: 'rgba(255,138,101,0.08)' }}>
                  {h.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{h.name}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginTop: 2 }}>{h.details}</p>
                </div>
                <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700, ...h.statusStyle }}>{h.status}</span>
              </div>
            ))}
          </div>

          {/* Team chat panel */}
          <div
            className="scroll-reveal"
            ref={el => revealRefs.current[1] = el}
            style={{ padding: 28, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>💬 Team Alpha Chat</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.self ? 'row-reverse' : 'row' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: m.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700, color: 'white',
                  }}>{m.initials}</div>
                  <div style={{
                    padding: '10px 16px', borderRadius: 16, fontSize: '0.8rem', lineHeight: 1.6, maxWidth: '75%',
                    background: m.self ? 'linear-gradient(135deg, var(--peach), var(--coral))' : 'var(--bg)',
                    color: m.self ? 'white' : 'var(--text-body)',
                    borderTopRightRadius: m.self ? 4 : 16,
                    borderTopLeftRadius: m.self ? 16 : 4,
                  }}>{m.text}</div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  placeholder="Message your team..."
                  style={{
                    flex: 1, padding: '12px 18px', borderRadius: 14, background: 'var(--bg)',
                    border: '1px solid rgba(0,0,0,0.06)', fontFamily: 'inherit',
                    fontSize: '0.8rem', color: 'var(--text-dark)', outline: 'none',
                  }}
                />
                <button style={{
                  width: 44, height: 44, borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, var(--peach), var(--coral))',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
