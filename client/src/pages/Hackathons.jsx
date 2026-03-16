import React, { useState } from 'react';
import Navigation from '../components/Navigation';

const hackathons = [
  { name: 'SMU .Hack 2025', emoji: '\u{1f680}', date: 'Feb 14\u201316', prize: '$10,000', spotsLeft: 12, status: 'LIVE', statusBg: 'rgba(224,93,80,0.12)', statusColor: 'var(--accent)', tags: ['Web', 'AI/ML', 'Social Impact'] },
  { name: 'HackNUS 2025', emoji: '\u{1f9e0}', date: 'Mar 1\u20133', prize: '$8,000', spotsLeft: 28, status: 'OPEN', statusBg: 'rgba(102,187,106,0.12)', statusColor: '#5a9a5e', tags: ['EdTech', 'FinTech', 'Open Track'] },
  { name: 'NTU AI Challenge', emoji: '\u{1f916}', date: 'Mar 15\u201317', prize: '$15,000', spotsLeft: 44, status: 'SOON', statusBg: 'rgba(66,165,245,0.12)', statusColor: 'var(--sky)', tags: ['AI/ML', 'Computer Vision', 'NLP'] },
  { name: 'SUTD GameJam', emoji: '\u{1f3ae}', date: 'Apr 5\u20136', prize: '$5,000', spotsLeft: 66, status: 'SOON', statusBg: 'rgba(66,165,245,0.12)', statusColor: 'var(--sky)', tags: ['Gaming', 'Creative', 'Mobile'] },
];

const filters = ['All Events', 'Live Now', 'Open Registration', 'Coming Soon'];

export default function Hackathons() {
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [registered, setRegistered] = useState({});

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 8 }}>
            Hackathons
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)' }}>
            Browse upcoming events across Singapore universities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
                border: activeFilter === f ? 'none' : '1.5px solid rgba(0,0,0,0.08)',
                background: activeFilter === f ? 'var(--accent)' : 'var(--bg-card)',
                color: activeFilter === f ? 'white' : 'var(--text-soft)',
                fontFamily: 'inherit',
              }}
            >{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {hackathons.map(h => (
            <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 22px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <span style={{ fontSize: '2rem', flexShrink: 0, lineHeight: 1 }}>{h.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{h.name}</h3>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, color: h.statusColor, background: h.statusBg }}>{h.status}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 500 }}>{h.date}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 500 }}>{'💰'} {h.prize}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 500 }}>{'🎫'} {h.spotsLeft} spots left</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {h.tags.map(t => (
                      <span key={t} style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.6rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: 'var(--bg)', color: 'var(--text-soft)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRegistered(r => ({ ...r, [h.name]: !r[h.name] }))}
                style={{
                  padding: '8px 20px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'opacity 0.2s',
                  background: registered[h.name] ? 'var(--bg)' : 'var(--accent)',
                  color: registered[h.name] ? 'var(--accent)' : 'white',
                }}
              >
                {registered[h.name] ? '\u2713 Registered' : 'Register'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
