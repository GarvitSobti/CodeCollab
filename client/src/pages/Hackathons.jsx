import React, { useCallback, useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const filters = ['All Events', 'Live Now', 'Open Registration', 'Coming Soon'];

const STATUS_STYLE = {
  LIVE: { bg: 'rgba(224,93,80,0.12)', color: 'var(--accent)' },
  OPEN: { bg: 'rgba(102,187,106,0.12)', color: '#5a9a5e' },
  SOON: { bg: 'rgba(66,165,245,0.12)', color: 'var(--sky)' },
  ENDED: { bg: 'rgba(160,160,160,0.12)', color: 'var(--text-soft)' },
};

const STATUS_EMOJI = {
  LIVE: '\u{1f680}',
  OPEN: '\u{1f4e3}',
  SOON: '\u{1f552}',
  ENDED: '\u{1f3c1}',
};

function formatDateRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const opts = { month: 'short', day: 'numeric' };
  if (s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString('en-SG', opts)}\u2013${e.getDate()}`;
  }
  return `${s.toLocaleDateString('en-SG', opts)}\u2013${e.toLocaleDateString('en-SG', opts)}`;
}

export default function Hackathons() {
  const { isAuthenticated } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [hackRes, interestRes] = await Promise.all([
          api.get('/api/v1/hackathons'),
          isAuthenticated
            ? api.get('/api/v1/hackathons/me/interests').catch(() => ({ data: { hackathonIds: [] } }))
            : Promise.resolve({ data: { hackathonIds: [] } }),
        ]);
        setHackathons(hackRes.data.hackathons || []);
        setRegisteredIds(new Set(interestRes.data.hackathonIds || []));
      } catch (err) {
        console.error('Failed to load hackathons:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isAuthenticated]);

  const toggleInterest = useCallback(async (id) => {
    if (!isAuthenticated) return;
    setTogglingId(id);
    try {
      const res = await api.post(`/api/v1/hackathons/${id}/interest`);
      setRegisteredIds((prev) => {
        const next = new Set(prev);
        if (res.data.registered) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to toggle interest:', err);
    } finally {
      setTogglingId(null);
    }
  }, [isAuthenticated]);

  const filtered = hackathons.filter((h) => {
    if (activeFilter === 'All Events') return true;
    if (activeFilter === 'Live Now') return h.status === 'LIVE';
    if (activeFilter === 'Open Registration') return h.status === 'OPEN';
    if (activeFilter === 'Coming Soon') return h.status === 'SOON';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 8 }}>
            Hackathons
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-body)' }}>
            Browse upcoming events across Singapore universities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 18px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
                border: activeFilter === f ? 'none' : '1.5px solid var(--border-strong)',
                background: activeFilter === f ? 'var(--accent)' : 'var(--bg-card)',
                color: activeFilter === f ? 'white' : 'var(--text-soft)',
                fontFamily: 'inherit',
              }}
            >{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-soft)', fontWeight: 600 }}>
            Loading hackathons...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-soft)', fontWeight: 600 }}>
            No hackathons found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(h => {
              const style = STATUS_STYLE[h.status] || STATUS_STYLE.SOON;
              const emoji = STATUS_EMOJI[h.status] || '\u{1f4c5}';
              const isRegistered = registeredIds.has(h.id);
              const isToggling = togglingId === h.id;

              return (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 22px', borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', transition: 'box-shadow 0.2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ fontSize: '2rem', flexShrink: 0, lineHeight: 1 }}>{emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{h.name}</h3>
                      <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, color: style.color, background: style.bg }}>{h.status}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 500 }}>
                        {formatDateRange(h.startDate, h.endDate)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 500 }}>
                        {'\ud83d\udccd'} {h.isOnline ? 'Online' : h.location}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 500 }}>
                        {'\ud83d\udc65'} Teams of {h.minTeamSize}\u2013{h.maxTeamSize}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 500 }}>
                        {'\u2b50'} {h.interestedCount} interested
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {(h.tags || []).map(t => (
                          <span key={t} style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.6rem', fontWeight: 600, fontFamily: "'Fira Code', monospace", background: 'var(--bg)', color: 'var(--text-soft)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={isToggling || !isAuthenticated}
                    onClick={() => toggleInterest(h.id)}
                    title={!isAuthenticated ? 'Log in to register' : ''}
                    style={{
                      padding: '8px 20px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 700,
                      border: 'none', cursor: isAuthenticated ? 'pointer' : 'not-allowed', fontFamily: 'inherit', flexShrink: 0, transition: 'opacity 0.2s',
                      background: isRegistered ? 'var(--bg)' : 'var(--accent)',
                      color: isRegistered ? 'var(--accent)' : 'white',
                      opacity: isToggling ? 0.6 : 1,
                    }}
                  >
                    {isRegistered ? '\u2713 Registered' : 'Register'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
