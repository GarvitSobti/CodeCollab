import React, { useState } from 'react';
import Navigation from '../components/Navigation';

const hackathons = [
  { name: 'SMU .Hack 2025', emoji: '🚀', desc: "Singapore Management University's flagship hackathon. Build innovative solutions for real-world problems with 120+ participants.", date: 'Feb 14-16', prize: '$10,000', participants: 120, spotsLeft: 12, status: 'LIVE', statusStyle: { background: 'rgba(255,107,107,0.12)', color: 'var(--coral)' }, bannerGrad: 'linear-gradient(135deg,#ffe0d6,#ffd4cc)', tags: ['Web', 'AI/ML', 'Social Impact'], tagColors: [{ bg: 'rgba(255,107,107,0.1)', c: '#ff6b6b' }, { bg: 'rgba(66,165,245,0.1)', c: '#42a5f5' }, { bg: 'rgba(102,187,106,0.1)', c: '#66bb6a' }], teamAvatars: ['JT', 'WM', 'EH'] },
  { name: 'HackNUS 2025', emoji: '🧠', desc: 'National University of Singapore\'s annual hackathon focused on building products that solve real problems for students and communities.', date: 'Mar 1-3', prize: '$8,000', participants: 89, spotsLeft: 28, status: 'OPEN', statusStyle: { background: 'rgba(102,187,106,0.12)', color: 'var(--mint)' }, bannerGrad: 'linear-gradient(135deg,#dcf5dd,#c8eeca)', tags: ['EdTech', 'FinTech', 'Open Track'], tagColors: [{ bg: 'rgba(255,202,40,0.1)', c: '#f9a825' }, { bg: 'rgba(179,157,219,0.1)', c: '#b39ddb' }, { bg: 'rgba(255,138,101,0.1)', c: '#ff8a65' }], teamAvatars: ['PS', 'AN'] },
  { name: 'NTU AI Challenge', emoji: '🤖', desc: 'Push the boundaries of artificial intelligence. Teams compete to build the most innovative AI-powered application in 48 hours.', date: 'Mar 15-17', prize: '$15,000', participants: 56, spotsLeft: 44, status: 'SOON', statusStyle: { background: 'rgba(66,165,245,0.12)', color: 'var(--sky)' }, bannerGrad: 'linear-gradient(135deg,#d6eaff,#c8e0ff)', tags: ['AI/ML', 'Computer Vision', 'NLP'], tagColors: [{ bg: 'rgba(66,165,245,0.1)', c: '#42a5f5' }, { bg: 'rgba(102,187,106,0.1)', c: '#66bb6a' }, { bg: 'rgba(255,202,40,0.1)', c: '#f9a825' }], teamAvatars: ['SL'] },
  { name: 'SUTD GameJam', emoji: '🎮', desc: 'Design and build a game from scratch in 36 hours. Any genre, any platform. Judged on creativity, technical execution, and fun factor.', date: 'Apr 5-6', prize: '$5,000', participants: 34, spotsLeft: 66, status: 'SOON', statusStyle: { background: 'rgba(66,165,245,0.12)', color: 'var(--sky)' }, bannerGrad: 'linear-gradient(135deg,#ece0ff,#e0d4f5)', tags: ['Gaming', 'Creative', 'Mobile'], tagColors: [{ bg: 'rgba(179,157,219,0.1)', c: '#b39ddb' }, { bg: 'rgba(240,98,146,0.1)', c: '#f06292' }, { bg: 'rgba(102,187,106,0.1)', c: '#66bb6a' }], teamAvatars: [] },
];

const filters = ['All Events', '🔴 Live Now', '🟢 Open Registration', '🔵 Coming Soon', '💰 Prize > $10K', '🧠 AI/ML', '🎮 Gaming', '🌏 Sustainability'];
const gradients = ['linear-gradient(135deg,#ff6b6b,#ff8a65)', 'linear-gradient(135deg,#42a5f5,#1e88e5)', 'linear-gradient(135deg,#b39ddb,#7e57c2)', 'linear-gradient(135deg,#66bb6a,#43a047)', 'linear-gradient(135deg,#ffca28,#ff8a65)'];

export default function Hackathons() {
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [registered, setRegistered] = useState({});

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" /><div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" /><div className="mesh-blob blob-4" />
      </div>
      <div className="noise" />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 8 }}>
            🌸 Hackathon <span className="flowing-text">Discovery</span>
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
            Browse upcoming hackathons across Singapore universities. Find the perfect event, register, and find teammates all in one place.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <div
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.3s',
                border: activeFilter === f ? 'none' : '1.5px solid rgba(0,0,0,0.08)',
                background: activeFilter === f ? 'linear-gradient(135deg, var(--peach), var(--coral))' : 'var(--bg-card)',
                color: activeFilter === f ? 'white' : 'var(--text-soft)',
              }}
            >{f}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
          {hackathons.map(h => (
            <div key={h.name} style={{ borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-heavy)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
            >
              <div style={{ height: 160, position: 'relative', background: h.bannerGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '3.5rem', zIndex: 2 }}>{h.emoji}</span>
                <span style={{ position: 'absolute', top: 14, right: 14, padding: '5px 14px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, ...h.statusStyle }}>{h.status}</span>
                <span style={{ position: 'absolute', top: 14, left: 14, padding: '5px 12px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', color: 'var(--text-dark)' }}>{h.date}</span>
              </div>
              <div style={{ padding: 22 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>{h.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 16 }}>{h.desc}</p>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  {[{ icon: '💰', text: h.prize }, { icon: '👥', text: `${h.participants} registered` }, { icon: '🎫', text: `${h.spotsLeft} spots left` }].map(m => (
                    <span key={m.text} style={{ fontSize: '0.72rem', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500 }}>{m.icon} {m.text}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
                  {h.tags.map((t, i) => (
                    <span key={t} style={{ padding: '3px 10px', borderRadius: 8, fontSize: '0.62rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: h.tagColors[i].bg, color: h.tagColors[i].c }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex' }}>
                    {h.teamAvatars.map((a, i) => (
                      <div key={a} style={{ width: 28, height: 28, borderRadius: 9, background: gradients[i % gradients.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'white', marginLeft: i === 0 ? 0 : -6, border: '2px solid var(--bg-card)' }}>{a}</div>
                    ))}
                  </div>
                  <button
                    onClick={() => setRegistered(r => ({ ...r, [h.name]: !r[h.name] }))}
                    style={{
                      padding: '8px 20px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 700,
                      border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                      background: registered[h.name] ? 'var(--bg)' : 'linear-gradient(135deg, var(--peach), var(--coral))',
                      color: registered[h.name] ? 'var(--mint)' : 'white',
                      boxShadow: registered[h.name] ? 'none' : '0 4px 16px rgba(255,138,101,0.3)',
                    }}
                  >
                    {registered[h.name] ? '✓ Registered' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
