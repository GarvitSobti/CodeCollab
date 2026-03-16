import React from 'react';
import Navigation from '../components/Navigation';

const skills = [
  { name: 'React', pct: 92 },
  { name: 'TypeScript', pct: 88 },
  { name: 'Node.js', pct: 85 },
  { name: 'PostgreSQL', pct: 78 },
  { name: 'Python', pct: 76 },
  { name: 'Figma', pct: 70 },
];

const extraSkills = ['Firebase', 'Docker', 'AWS'];

const reviews = [
  { initials: 'JT', name: 'Jamie Tan', event: 'SMU .Hack 2024', stars: 5, gradient: 'linear-gradient(135deg,#ff6b6b,#ff8a65)', text: '"Emily is an absolute powerhouse. She took ownership of the frontend and delivered a flawless demo. Her attention to detail is next-level."' },
  { initials: 'WM', name: 'Wei Ming Chen', event: 'HackNUS 2024', stars: 5, gradient: 'linear-gradient(135deg,#42a5f5,#1e88e5)', text: '"Best teammate I\'ve had. Emily bridges the gap between design and engineering beautifully. Great at keeping team morale up during crunch time."' },
  { initials: 'PS', name: 'Priya Sharma', event: 'NTU AI Challenge 2024', stars: 4, gradient: 'linear-gradient(135deg,#b39ddb,#7e57c2)', text: '"Emily picked up our codebase incredibly fast and contributed meaningful features from day one. Would absolutely team up with her again."' },
];

const activity = [
  { icon: '🏆', title: 'Won 2nd Place at SMU .Hack 2024', sub: 'Built a real-time collaboration tool with Team Alpha · 2 weeks ago' },
  { icon: '🤝', title: 'Connected with Sarah Lim', sub: 'New teammate match (90% compatibility) · 3 days ago' },
  { icon: '⭐', title: 'Received a 5-star review', sub: 'From Wei Ming Chen after HackNUS 2024 · 1 week ago' },
  { icon: '📝', title: 'Registered for HackNUS 2025', sub: 'Looking for 1 more teammate · 5 days ago' },
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
              <p style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 20 }}>Full-stack developer passionate about building products that connect people. Hackathon enthusiast since freshman year.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                {[{ val: '7', lbl: 'Hackathons' }, { val: '4.9', lbl: 'Rating' }, { val: '23', lbl: 'Reviews' }].map(s => (
                  <div key={s.lbl} style={{ padding: '14px 8px', borderRadius: 14, background: 'var(--bg)', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, display: 'block' }}>{s.val}</span>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.lbl}</span>
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', padding: 12, borderRadius: 14, border: '1.5px solid rgba(0,0,0,0.08)', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'}
              >Edit Profile</button>
            </div>
          </div>

          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Skills */}
            <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Skills & Technologies</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {skills.map(s => <span key={s.name} style={{ padding: '6px 16px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: 'var(--bg-warm)', color: 'var(--text-body)', cursor: 'default' }}>{s.name}</span>)}
                {extraSkills.map(s => <span key={s} style={{ padding: '6px 16px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: 'var(--bg-warm)', color: 'var(--text-body)' }}>{s}</span>)}
                <button style={{ padding: '6px 16px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, border: '2px dashed rgba(0,0,0,0.1)', background: 'transparent', color: 'var(--text-soft)', cursor: 'pointer' }}>+ Add Skill</button>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, marginTop: 8 }}>Skill Proficiency</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {skills.map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)', whiteSpace: 'nowrap', width: 80 }}>{s.name}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.pct}%`, borderRadius: 3, background: 'var(--accent)' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, fontFamily: "'Fira Code', monospace", color: 'var(--text-soft)', width: 32, textAlign: 'right' }}>{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Peer Reviews</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.map(r => (
                  <div key={r.name} style={{ padding: 18, borderRadius: 16, background: 'var(--bg)', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: r.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'white' }}>{r.initials}</div>
                        <div>
                          <h5 style={{ fontSize: '0.78rem', fontWeight: 700 }}>{r.name}</h5>
                          <p style={{ fontSize: '0.62rem', color: 'var(--text-soft)' }}>{r.event}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-body)', lineHeight: 1.6, fontStyle: 'italic' }}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activity.map(a => (
                  <div key={a.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 16px', borderRadius: 14, background: 'var(--bg)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{a.icon}</div>
                    <div>
                      <h5 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 2 }}>{a.title}</h5>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-soft)' }}>{a.sub}</p>
                    </div>
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
