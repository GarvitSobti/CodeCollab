import React from 'react';

export default function TeamsSidebar({ teams, selectedTeamId, onSelectTeam }) {
  return (
    <aside
      style={{
        width: '100%',
        maxWidth: 320,
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid rgba(0,0,0,0.04)',
        padding: 20,
        height: 'fit-content',
        position: 'sticky',
        top: 88,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Your Teams</h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-soft)', lineHeight: 1.5 }}>Select a team to open its sprint board, members, and chat snapshot.</p>
      </div>

      <div className="teams-sidebar-scroll" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {teams.map((team) => {
          const selected = team.id === selectedTeamId;

          return (
            <button
              type="button"
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                borderRadius: 16,
                border: selected ? '1.5px solid rgba(255,138,101,0.45)' : '1px solid rgba(0,0,0,0.06)',
                background: selected
                  ? 'linear-gradient(135deg, rgba(255,138,101,0.16), rgba(255,107,107,0.08))'
                  : 'var(--bg)',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{ fontSize: '1.05rem' }}>{team.emoji}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{team.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)', marginTop: 2 }}>{team.activity}</div>
                  </div>
                </div>
                {team.unread > 0 && (
                  <span
                    style={{
                      minWidth: 20,
                      height: 20,
                      borderRadius: 10,
                      padding: '0 6px',
                      background: 'linear-gradient(135deg, var(--peach), var(--coral))',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {team.unread}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-body)', marginTop: 8, lineHeight: 1.5 }}>{team.tagline}</p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        style={{
          marginTop: 14,
          width: '100%',
          borderRadius: 12,
          border: '1px dashed rgba(0,0,0,0.15)',
          padding: '10px 14px',
          background: 'transparent',
          color: 'var(--text-soft)',
          fontSize: '0.76rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        + Create New Team
      </button>
    </aside>
  );
}
