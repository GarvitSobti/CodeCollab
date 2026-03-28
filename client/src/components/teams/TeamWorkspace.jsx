import React, { useState } from 'react';

const STATUS_STYLE = {
  FORMING: { color: 'var(--sky)', bg: 'rgba(66,165,245,0.12)', label: 'Forming' },
  COMPLETE: { color: 'var(--mint)', bg: 'rgba(102,187,106,0.12)', label: 'Complete' },
  COMPETING: { color: 'var(--honey)', bg: 'rgba(255,202,40,0.16)', label: 'Competing' },
  FINISHED: { color: 'var(--text-soft)', bg: 'rgba(160,160,160,0.12)', label: 'Finished' },
};

const ROLE_STYLE = {
  LEADER: { bg: 'rgba(255,138,101,0.1)', c: 'var(--coral)' },
  MEMBER: { bg: 'rgba(66,165,245,0.1)', c: 'var(--sky)' },
};

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function MemberAvatar({ src, name }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return (
    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0 }}>
      {getInitials(name)}
    </div>
  );
}

function getSkillNames(profile) {
  if (!profile?.skills) return [];
  const skills = profile.skills;
  if (Array.isArray(skills)) return skills.map((s) => s.name || s).filter(Boolean).slice(0, 4);
  return [];
}

export default function TeamWorkspace({ team, onOpenMessages, onDM, onInviteMember, onLeaveTeam }) {
  if (!team) return null;

  const statusStyle = STATUS_STYLE[team.status] || STATUS_STYLE.FORMING;
  const members = team.members || [];
  const hackathon = team.hackathon;

  return (
    <section style={{ width: '100%', minWidth: 0 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 8 }}>
          <span className="flowing-text">{team.name}</span>
        </h1>
        {hackathon && (
          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)' }}>
            Competing in <strong>{hackathon.name}</strong>
            {hackathon.startDate && (
              <span style={{ color: 'var(--text-soft)', marginLeft: 8 }}>
                {new Date(hackathon.startDate).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}
                {hackathon.endDate && `\u2013${new Date(hackathon.endDate).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}`}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Team overview card */}
      <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{team.name}</h2>
          <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color }}>
            {statusStyle.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, display: 'block', color: 'var(--coral)' }}>{members.length}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Members</span>
          </div>
          {hackathon?.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
              {hackathon.tags.map((t) => (
                <span key={t} style={{ padding: '3px 9px', borderRadius: 8, fontSize: '0.62rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: 'var(--bg)', color: 'var(--text-soft)' }}>{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Members header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Team Members</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onInviteMember}
            style={{ padding: '8px 18px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Invite Member
          </button>
          <button
            onClick={() => onLeaveTeam(team.id)}
            style={{ padding: '8px 18px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, border: '1.5px solid rgba(224,93,80,0.3)', background: 'transparent', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Leave Team
          </button>
        </div>
      </div>

      {/* Member cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
        {members.map((membership, idx) => {
          const member = membership.user || {};
          const profile = member.profile;
          const roleStyle = ROLE_STYLE[membership.role] || ROLE_STYLE.MEMBER;
          const skills = getSkillNames(profile);

          return (
            <div
              key={member.id || idx}
              style={{
                padding: 22, borderRadius: 20, background: 'var(--bg-card)',
                boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)',
                transition: 'all 0.3s', position: 'relative',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-heavy)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <MemberAvatar
                  src={profile?.photoDataUrl || member.avatarUrl}
                  name={member.name}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{member.name || 'Unknown'}</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>
                    {member.university || ''}{member.graduationYear ? ` · Year ${member.graduationYear}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDM(membership)}
                  title={`Message ${(member.name || '').split(' ')[0]}`}
                  style={{
                    width: 32, height: 32, borderRadius: 10,
                    border: '1.5px solid rgba(0,0,0,0.07)', background: 'var(--bg)',
                    cursor: 'pointer', flexShrink: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-soft)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg,var(--peach),var(--coral))'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'; e.currentTarget.style.color = 'var(--text-soft)'; }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </button>
              </div>
              <span
                style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 9,
                  fontSize: '0.65rem', fontWeight: 700, marginBottom: 12,
                  background: roleStyle.bg, color: roleStyle.c,
                }}
              >
                {membership.role === 'LEADER' ? 'Team Leader' : 'Member'}
              </span>
              {skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {skills.map((skill) => (
                    <span key={skill} style={{ padding: '3px 9px', borderRadius: 8, fontSize: '0.62rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: 'var(--bg)', color: 'var(--text-soft)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              {profile?.major && (
                <p style={{ fontSize: '0.68rem', color: 'var(--text-soft)' }}>{profile.major}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Pending invites section */}
      {team.invites?.length > 0 && (
        <div style={{ padding: 24, borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>📨 Pending Invites</div>
          {team.invites.map((inv) => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'var(--bg)', marginBottom: 8 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{inv.toUser?.name || inv.toUser?.email}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)', padding: '2px 8px', borderRadius: 6, background: 'rgba(255,202,40,0.16)' }}>Pending</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
