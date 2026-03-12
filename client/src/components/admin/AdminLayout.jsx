import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const petalColors = ['var(--peach)', 'var(--coral)', 'var(--lavender)', 'var(--mint)', 'var(--sky)'];
const petalAngles = [270, 342, 54, 126, 198];

const links = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Hackathons', to: '/admin/hackathons' },
  { label: 'Company', to: '/admin/company' },
  { label: 'Audit Logs', to: '/admin/audit-logs' }
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const rawAdmin = localStorage.getItem('admin_user');
  const admin = rawAdmin ? JSON.parse(rawAdmin) : null;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_company');
    navigate('/admin/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="noise" />
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 28px',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer'
            }}
          >
            <div style={{ width: 30, height: 30, position: 'relative' }}>
              {petalColors.map((bg, i) => {
                const r = 8;
                const angle = (petalAngles[i] * Math.PI) / 180;
                const x = 50 + r * Math.cos(angle);
                const y = 50 + r * Math.sin(angle);
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: bg,
                      top: `${y}%`,
                      left: `${x}%`,
                      transform: 'translate(-50%,-50%)'
                    }}
                  />
                );
              })}
              <div
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--honey)',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%,-50%)',
                  zIndex: 2
                }}
              />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>CodeCollab</span>
          </button>
          <nav style={{ display: 'flex', gap: 8 }}>
            {links.map((link) => {
              const active = location.pathname === link.to || (link.to !== '/admin' && location.pathname.startsWith(link.to));
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    padding: '8px 14px',
                    borderRadius: 10,
                    color: active ? 'white' : 'var(--text-body)',
                    background: active ? 'linear-gradient(135deg, var(--peach), var(--coral))' : 'transparent'
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>
            {admin?.fullName || admin?.email} · {admin?.role}
          </div>
          <button
            onClick={handleLogout}
            style={{
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 10,
              padding: '8px 12px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {children}
      </main>
    </div>
  );
}
