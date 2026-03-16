import React from 'react';
import Navigation from '../components/Navigation';

const members = [
  { initials: 'JT', name: 'Jamie Tan', uni: 'NUS · CS Year 2', role: 'Frontend Lead', gradient: 'linear-gradient(135deg,#ff6b6b,#ff8a65)', skills: ['React', 'TypeScript', 'Figma'] },
  { initials: 'WM', name: 'Wei Ming Chen', uni: 'NTU · CE Year 3', role: 'ML Engineer', gradient: 'linear-gradient(135deg,#42a5f5,#1e88e5)', skills: ['Python', 'TensorFlow', 'AWS'] },
  { initials: 'EH', name: 'Emily Huang', uni: 'SMU · IS Year 3', role: 'Full-Stack', gradient: 'linear-gradient(135deg,#ff8a65,#ff6b6b)', skills: ['Node.js', 'React', 'PostgreSQL'] },
  { initials: 'PS', name: 'Priya Sharma', uni: 'SMU · IS Year 2', role: 'Backend Dev', gradient: 'linear-gradient(135deg,#b39ddb,#7e57c2)', skills: ['Node.js', 'Docker', 'PostgreSQL'] },
];

const sprint = [
  { emoji: '\u2705', title: 'API Matching Algorithm', sub: 'Wei Ming \u00b7 Completed' },
  { emoji: '\u{1f504}', title: 'Swipe UI Component', sub: 'Jamie \u00b7 In Progress' },
  { emoji: '\u{1f4dd}', title: 'Database Migration', sub: 'Priya \u00b7 In Progress' },
  { emoji: '\u23f3', title: 'Pitch Deck', sub: 'You \u00b7 Pending' },
];

export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1300, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2 }}>
              Team <span style={{ color: 'var(--accent)' }}>Alpha</span>
            </h1>
            <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(102,187,106,0.12)', color: '#5a9a5e' }}>Active</span>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', maxWidth: 600 }}>
            Building CodeCollab — the ultimate hackathon teammate finder. Competing in SMU .Hack 2025.
          </p>
        </div>

        {/* Sprint */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Current Sprint</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sprint.map(s => (
              <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'var(--bg-warm)' }}>
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{s.emoji}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>{s.title}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginLeft: 'auto' }}>{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Members */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Members</h2>
            <button style={{ padding: '6px 14px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 600, border: '1.5px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-soft)', cursor: 'pointer', fontFamily: 'inherit' }}>+ Invite</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {members.map(m => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: m.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>{m.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{m.name}</span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'var(--accent-light)', color: 'var(--accent)' }}>{m.role}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{m.uni}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexShrink: 0 }}>
                  {m.skills.map(s => (
                    <span key={s} style={{ padding: '3px 8px', borderRadius: 6, fontSize: '0.6rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: 'var(--bg)', color: 'var(--text-soft)' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
