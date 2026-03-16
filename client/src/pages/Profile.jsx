import React from 'react';
import Navigation from '../components/Navigation';

const skills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Python', 'Figma', 'Firebase', 'Docker', 'AWS'];

const reviews = [
  { initials: 'JT', name: 'Jamie Tan', event: 'SMU .Hack 2024', stars: 5, gradient: 'linear-gradient(135deg,#ff6b6b,#ff8a65)', text: '\u201cEmily is an absolute powerhouse. She took ownership of the frontend and delivered a flawless demo. Her attention to detail is next-level.\u201d' },
  { initials: 'WM', name: 'Wei Ming Chen', event: 'HackNUS 2024', stars: 5, gradient: 'linear-gradient(135deg,#42a5f5,#1e88e5)', text: '\u201cBest teammate I\'ve had. Emily bridges the gap between design and engineering beautifully. Great at keeping team morale up during crunch time.\u201d' },
  { initials: 'PS', name: 'Priya Sharma', event: 'NTU AI Challenge 2024', stars: 4, gradient: 'linear-gradient(135deg,#b39ddb,#7e57c2)', text: '\u201cEmily picked up our codebase incredibly fast and contributed meaningful features from day one. Would absolutely team up with her again.\u201d' },
];

const activity = [
  { icon: '\u{1f3c6}', title: 'Won 2nd Place at SMU .Hack 2024', sub: 'Team Alpha · 2 weeks ago' },
  { icon: '\u{1f91d}', title: 'Connected with Sarah Lim', sub: '90% compatibility · 3 days ago' },
  { icon: '\u2b50', title: 'Received 5-star review from Wei Ming', sub: 'HackNUS 2024 · 1 week ago' },
  { icon: '\u{1f4dd}', title: 'Registered for HackNUS 2025', sub: '5 days ago' },
];

export default function Profile() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>

          {/* Sidebar */}
          <div style={{ borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ height: 120, background: 'linear-gradient(135deg,#ffe0d6,#ffd4cc,#e8d4ff,#d6eaff)', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)' }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.6rem', color: 'white', border: '4px solid var(--bg-card)', boxShadow: 'var(--shadow-soft)' }}>EH</div>
              </div>
            </div>
            <div style={{ padding: '48px 24px 28px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Emily Huang</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: 4 }}>SMU · Information Systems · Year 3</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 8 }}>Full-stack developer passionate about building products that connect people. Hackathon enthusiast since freshman year.</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginBottom: 20 }}>7 hackathons · 4.9 rating · 23 reviews</p>
              <button style={{ width: '100%', padding: 12, borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.08)', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)', cursor: 'pointer' }}>Edit Profile</button>
            </div>
          </div>

          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Skills */}
            <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skills.map(s => <span key={s} style={{ padding: '6px 16px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: 'var(--bg-warm)', color: 'var(--text-body)' }}>{s}</span>)}
                <button style={{ padding: '6px 16px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, border: '2px dashed rgba(0,0,0,0.1)', background: 'transparent', color: 'var(--text-soft)', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
              </div>
            </div>

            {/* Reviews */}
            <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>Peer Reviews</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.map(r => (
                  <div key={r.name} style={{ padding: 16, borderRadius: 14, background: 'var(--bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: r.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'white' }}>{r.initials}</div>
                        <div>
                          <h5 style={{ fontSize: '0.78rem', fontWeight: 700 }}>{r.name}</h5>
                          <p style={{ fontSize: '0.62rem', color: 'var(--text-soft)' }}>{r.event}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>{'\u2605'.repeat(r.stars)}{'\u2606'.repeat(5 - r.stars)}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: 1.6, fontStyle: 'italic' }}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activity.map((a, i) => (
                  <div key={a.title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < activity.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>{a.icon}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)' }}>{a.title}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-soft)', marginLeft: 'auto', flexShrink: 0 }}>{a.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
