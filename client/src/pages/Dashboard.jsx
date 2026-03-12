import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useChatContext } from '../contexts/ChatContext';

const members = [
  { initials: 'JT', name: 'Jamie Tan', uni: 'NUS · CS Year 2', role: 'Frontend Lead', roleColor: { bg: 'rgba(255,107,107,0.1)', c: 'var(--coral)' }, gradient: 'linear-gradient(135deg,#ff6b6b,#ff8a65)', skills: ['React', 'TypeScript', 'Figma'], progress: 87 },
  { initials: 'WM', name: 'Wei Ming Chen', uni: 'NTU · CE Year 3', role: 'ML Engineer', roleColor: { bg: 'rgba(66,165,245,0.1)', c: 'var(--sky)' }, gradient: 'linear-gradient(135deg,#42a5f5,#1e88e5)', skills: ['Python', 'TensorFlow', 'AWS'], progress: 91 },
  { initials: 'EH', name: 'Emily Huang', uni: 'SMU · IS Year 3', role: 'Full-Stack', roleColor: { bg: 'rgba(255,138,101,0.1)', c: 'var(--peach)' }, gradient: 'linear-gradient(135deg,#ff8a65,#ff6b6b)', skills: ['Node.js', 'React', 'PostgreSQL'], progress: 78 },
  { initials: 'PS', name: 'Priya Sharma', uni: 'SMU · IS Year 2', role: 'Backend Dev', roleColor: { bg: 'rgba(179,157,219,0.1)', c: 'var(--lavender)' }, gradient: 'linear-gradient(135deg,#b39ddb,#7e57c2)', skills: ['Node.js', 'Docker', 'PostgreSQL'], progress: 82 },
];

const chatMessages = [
  { initials: 'JT', gradient: 'linear-gradient(135deg,var(--coral),var(--peach))', text: 'Just pushed the swipe animation update! Check the PR when you can 🎨', self: false },
  { initials: 'WM', gradient: 'linear-gradient(135deg,var(--sky),var(--lavender))', text: 'Matching algorithm v2 is up — accuracy went from 78% to 91%! 📈', self: false },
  { initials: 'EH', gradient: 'linear-gradient(135deg,var(--peach),var(--coral))', text: "Amazing work both of you! I'll review the PRs tonight", self: true },
  { initials: 'PS', gradient: 'linear-gradient(135deg,var(--lavender),var(--rose))', text: 'Database is optimized! Query time down to 12ms avg. Ready for the demo 🚀', self: false },
];

const sprint = [
  { emoji: '✅', title: 'API Matching Algorithm', sub: 'Assigned to Wei Ming · Completed', bg: 'rgba(102,187,106,0.12)' },
  { emoji: '🔄', title: 'Swipe UI Component', sub: 'Assigned to Jamie · In Progress', bg: 'rgba(255,138,101,0.12)' },
  { emoji: '📝', title: 'Database Migration', sub: 'Assigned to Priya · In Progress', bg: 'rgba(179,157,219,0.12)' },
  { emoji: '⏳', title: 'Pitch Deck', sub: 'Assigned to You · Pending', bg: 'rgba(66,165,245,0.12)' },
];

const memberIds = {
  'Jamie Tan': 'jamie',
  'Wei Ming Chen': 'weiming',
  'Emily Huang': 'emily',
  'Priya Sharma': 'priya',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { openOrCreateDM } = useChatContext();

  const handleDM = (member) => {
    const id = memberIds[member.name] || member.name.toLowerCase().replace(/\s+/g, '-');
    openOrCreateDM({
      id,
      name: member.name,
      initials: member.initials,
      gradient: member.gradient,
      online: false,
    });
    navigate('/messages');
  };

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
            🌿 Team <span className="flowing-text">Alpha</span>
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)' }}>
            Manage your hackathon squad. Assign roles, track progress, and keep the conversation flowing.
          </p>
        </div>

        {/* Team overview + sprint */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Team Alpha</h2>
              <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(102,187,106,0.12)', color: 'var(--mint)' }}>Active</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 18 }}>
              Building CodeCollab — the ultimate hackathon teammate finder for Singapore university students. Competing in SMU .Hack 2025.
            </p>
            <div style={{ display: 'flex', gap: 20 }}>
              {[{ val: '4', lbl: 'Members', c: 'var(--coral)' }, { val: '3', lbl: 'Hackathons', c: 'var(--mint)' }, { val: '★ 4.8', lbl: 'Avg Rating', c: 'var(--honey)' }, { val: '2', lbl: 'Wins', c: 'var(--sky)' }].map(s => (
                <div key={s.lbl} style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, display: 'block', color: s.c }}>{s.val}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>📋 Current Sprint</div>
            {sprint.map(s => (
              <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, marginBottom: 8, background: 'var(--bg)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{s.emoji}</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.title}</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginTop: 2 }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Team Members</h2>
          <button style={{ padding: '8px 18px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, border: '1.5px solid rgba(0,0,0,0.08)', background: 'var(--bg-card)', color: 'var(--text-soft)', cursor: 'pointer' }}>+ Invite Member</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
          {members.map(m => (
            <div key={m.name} style={{ padding: 22, borderRadius: 20, background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)', transition: 'all 0.3s', position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-heavy)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: m.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: 'white' }}>{m.initials}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{m.name}</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{m.uni}</p>
                </div>
                {/* DM button */}
                <button
                  onClick={() => handleDM(m)}
                  title={`Message ${m.name.split(' ')[0]}`}
                  style={{
                    width: 32, height: 32, borderRadius: 10, border: '1.5px solid rgba(0,0,0,0.07)',
                    background: 'var(--bg)', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-soft)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,var(--peach),var(--coral))'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'; e.currentTarget.style.color = 'var(--text-soft)'; }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </button>
              </div>
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 9, fontSize: '0.65rem', fontWeight: 700, marginBottom: 12, background: m.roleColor.bg, color: m.roleColor.c }}>{m.role}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                {m.skills.map(s => (
                  <span key={s} style={{ padding: '3px 9px', borderRadius: 8, fontSize: '0.62rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: 'var(--bg)', color: 'var(--text-soft)' }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>Contribution</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.progress}%`, borderRadius: 3, background: 'linear-gradient(90deg, var(--peach), var(--coral))', transition: 'width 1s' }} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, fontFamily: "'Fira Code', monospace", color: 'var(--coral)' }}>{m.progress}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Team chat */}
        <div style={{ padding: 28, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>💬 Team Chat</div>
            <button
              onClick={() => navigate('/messages')}
              style={{
                fontSize: '0.72rem', fontWeight: 600, color: 'var(--peach)',
                border: 'none', background: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Open in Messages
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.self ? 'row-reverse' : 'row' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: m.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{m.initials}</div>
                <div style={{ padding: '10px 16px', borderRadius: 16, fontSize: '0.8rem', lineHeight: 1.6, maxWidth: '75%', background: m.self ? 'linear-gradient(135deg, var(--peach), var(--coral))' : 'var(--bg)', color: m.self ? 'white' : 'var(--text-body)', borderTopRightRadius: m.self ? 4 : 16, borderTopLeftRadius: m.self ? 16 : 4 }}>{m.text}</div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input placeholder="Message Team Alpha..." style={{ flex: 1, padding: '12px 18px', borderRadius: 14, background: 'var(--bg)', border: '1px solid rgba(0,0,0,0.06)', fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)', outline: 'none' }} />
              <button style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, var(--peach), var(--coral))', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
