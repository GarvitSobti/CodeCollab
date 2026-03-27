import React from 'react';

export default function ProfilePopup({ open, user, onViewProfile, onLogout }) {
  if (!open) return null;

  const name = user?.name || 'Eleanor Howard';
  const email = user?.email || 'eleanor@codecollab.dev';
  const role = user?.role || 'Frontend Developer';
  const initials = user?.initials || name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        position: 'absolute',
        top: 48,
        right: 0,
        width: 280,
        borderRadius: 16,
        background: 'var(--bg-card)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 16px 42px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        zIndex: 200,
      }}
    >
      <div style={{
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'linear-gradient(135deg, rgba(255, 183, 164, 0.22), rgba(255, 138, 101, 0.16))',
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(135deg, var(--peach), var(--coral))',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '0.78rem',
          letterSpacing: '0.02em',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{name}</div>
          <div style={{ color: 'var(--text-soft)', fontSize: '0.78rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </div>
          <div style={{ color: 'var(--text-soft)', fontSize: '0.74rem', marginTop: 4 }}>{role}</div>
        </div>
      </div>

      <div style={{ padding: 10, display: 'grid', gap: 8 }}>
        <button
          onClick={onViewProfile}
          style={{
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: 10,
            height: 38,
            background: 'white',
            color: 'var(--text-dark)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View profile
        </button>

        <button
          onClick={onLogout}
          style={{
            border: 'none',
            borderRadius: 10,
            height: 38,
            background: 'linear-gradient(135deg, #ff9686, #ff7057)',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
