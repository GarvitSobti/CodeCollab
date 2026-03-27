import React from 'react';

export default function TeamWorkspace({ team, onOpenMessages, onDM }) {
  if (!team) {
    return null;
  }

  return (
    <section style={{ width: '100%', minWidth: 0 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 8 }}>
          {team.emoji} <span className="flowing-text">{team.name}</span>
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-body)' }}>{team.description}</p>
      </div>

      <div className="team-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{team.name}</h2>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 8,
                fontSize: '0.65rem',
                fontWeight: 700,
                background: team.statusBg,
                color: team.statusColor,
              }}
            >
              {team.status}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 18 }}>{team.tagline}</p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {team.stats.map((stat) => (
              <div key={stat.lbl} style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, display: 'block', color: stat.c }}>
                  {stat.prefix || ''}
                  {stat.val}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>📋 Current Sprint</div>
          {team.sprint.map((item) => (
            <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, marginBottom: 8, background: 'var(--bg)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{item.emoji}</div>
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.title}</h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginTop: 2 }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Team Members</h2>
        <button style={{ padding: '8px 18px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, border: '1.5px solid rgba(0,0,0,0.08)', background: 'var(--bg-card)', color: 'var(--text-soft)', cursor: 'pointer' }}>
          + Invite Member
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
        {team.members.map((member) => (
          <div
            key={member.id}
            style={{
              padding: 22,
              borderRadius: 20,
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid rgba(0,0,0,0.04)',
              transition: 'all 0.3s',
              position: 'relative',
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = 'translateY(-4px)';
              event.currentTarget.style.boxShadow = 'var(--shadow-heavy)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'none';
              event.currentTarget.style.boxShadow = 'var(--shadow-card)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: member.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: 'white' }}>
                {member.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{member.name}</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{member.uni}</p>
              </div>
              <button
                type="button"
                onClick={() => onDM(member)}
                title={`Message ${member.name.split(' ')[0]}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: '1.5px solid rgba(0,0,0,0.07)',
                  background: 'var(--bg)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-soft)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = 'linear-gradient(135deg,var(--peach),var(--coral))';
                  event.currentTarget.style.borderColor = 'transparent';
                  event.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = 'var(--bg)';
                  event.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)';
                  event.currentTarget.style.color = 'var(--text-soft)';
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </button>
            </div>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: 9,
                fontSize: '0.65rem',
                fontWeight: 700,
                marginBottom: 12,
                background: member.roleColor.bg,
                color: member.roleColor.c,
              }}
            >
              {member.role}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
              {member.skills.map((skill) => (
                <span key={skill} style={{ padding: '3px 9px', borderRadius: 8, fontSize: '0.62rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: 'var(--bg)', color: 'var(--text-soft)' }}>
                  {skill}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>Contribution</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${member.progress}%`,
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, var(--peach), var(--coral))',
                    transition: 'width 1s',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, fontFamily: "'Fira Code', monospace", color: 'var(--coral)' }}>{member.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 28, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>💬 Team Chat</div>
          <button
            type="button"
            onClick={onOpenMessages}
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--peach)',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Open in Messages
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {team.chatMessages.map((message, index) => (
            <div key={`${message.initials}-${index}`} style={{ display: 'flex', gap: 10, flexDirection: message.self ? 'row-reverse' : 'row' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: message.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {message.initials}
              </div>
              <div style={{ padding: '10px 16px', borderRadius: 16, fontSize: '0.8rem', lineHeight: 1.6, maxWidth: '75%', background: message.self ? 'linear-gradient(135deg, var(--peach), var(--coral))' : 'var(--bg)', color: message.self ? 'white' : 'var(--text-body)', borderTopRightRadius: message.self ? 4 : 16, borderTopLeftRadius: message.self ? 16 : 4 }}>
                {message.text}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              placeholder={`Message ${team.name}...`}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: 14,
                background: 'var(--bg)',
                border: '1px solid rgba(0,0,0,0.06)',
                fontFamily: 'inherit',
                fontSize: '0.8rem',
                color: 'var(--text-dark)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, var(--peach), var(--coral))', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
