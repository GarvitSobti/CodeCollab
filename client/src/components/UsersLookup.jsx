import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';

const ease = [0.16, 1, 0.3, 1];

const GRADIENTS = [
  'linear-gradient(145deg,#ff6b6b,#ff8a65)',
  'linear-gradient(145deg,#42a5f5,#1e88e5)',
  'linear-gradient(145deg,#b39ddb,#7e57c2)',
  'linear-gradient(145deg,#66bb6a,#43a047)',
  'linear-gradient(145deg,#ffca28,#ff8a65)',
  'linear-gradient(145deg,#f06292,#e91e63)',
  'linear-gradient(145deg,#4dd0e1,#0097a7)',
];

const SKILL_COLORS = [
  { bg: 'rgba(255,138,101,0.12)', color: 'var(--peach)' },
  { bg: 'rgba(66,165,245,0.12)', color: 'var(--sky)' },
  { bg: 'rgba(179,157,219,0.12)', color: 'var(--lavender)' },
  { bg: 'rgba(102,187,106,0.12)', color: 'var(--mint)' },
  { bg: 'rgba(240,98,146,0.12)', color: 'var(--rose)' },
  { bg: 'rgba(255,202,40,0.12)', color: 'var(--honey)' },
];

function gradientFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function tierLabel(tier) {
  if (tier === 'ADVANCED') return 'Advanced';
  if (tier === 'INTERMEDIATE') return 'Intermediate';
  return 'Beginner';
}

function tierStyle(tier) {
  if (tier === 'Advanced') return { color: 'var(--accent)', bg: 'rgba(224,93,80,0.1)' };
  if (tier === 'Intermediate') return { color: 'var(--sky)', bg: 'rgba(66,165,245,0.1)' };
  return { color: 'var(--text-soft)', bg: 'rgba(128,128,128,0.08)' };
}

// ─── User Card ───────────────────────────────────────────────────────────────

function UserCard({ user, index, onClick, isSelf }) {
  const gradient = gradientFor(user.id);
  const tier = tierLabel(user.profile?.internalSkillTier);
  const tc = tierStyle(tier);
  const skills = Array.isArray(user.profile?.skills)
    ? user.profile.skills.map((s) => s.name).filter(Boolean).slice(0, 3)
    : [];
  const totalSkills = Array.isArray(user.profile?.skills) ? user.profile.skills.length : 0;
  const uni = [user.university, user.profile?.major].filter(Boolean).join(' \u00b7 ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      style={{
        borderRadius: 16, background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        overflow: 'hidden', cursor: 'pointer',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      {/* Gradient accent */}
      <div style={{ height: 4, background: gradient }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Header: avatar + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
          {(user.avatarUrl || user.profile?.photoDataUrl) ? (
            <img
              src={user.avatarUrl || user.profile?.photoDataUrl}
              alt={user.name}
              style={{
                width: 44, height: 44, borderRadius: 12,
                objectFit: 'cover', flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.85rem', color: 'white', flexShrink: 0,
            }}>
              {getInitials(user.name)}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.88rem', fontWeight: 700, letterSpacing: '-0.02em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.name}
              </span>
              <span style={{
                padding: '2px 7px', borderRadius: 5, fontSize: '0.56rem',
                fontWeight: 700, background: tc.bg, color: tc.color, flexShrink: 0,
              }}>
                {tier}
              </span>
              {isSelf && (
                <span style={{
                  padding: '2px 7px', borderRadius: 5, fontSize: '0.56rem',
                  fontWeight: 700, background: 'rgba(224,93,80,0.1)', color: 'var(--accent)', flexShrink: 0,
                }}>
                  You
                </span>
              )}
            </div>
            {uni && (
              <p style={{
                fontSize: '0.68rem', color: 'var(--text-soft)', margin: '2px 0 0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {uni}
              </p>
            )}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {skills.map((s, i) => {
              const c = SKILL_COLORS[i % SKILL_COLORS.length];
              return (
                <span
                  key={s}
                  style={{
                    padding: '3px 8px', borderRadius: 5, fontSize: '0.62rem',
                    fontWeight: 600, fontFamily: "'Fira Code', monospace",
                    background: c.bg, color: c.color,
                  }}
                >
                  {s}
                </span>
              );
            })}
            {totalSkills > 3 && (
              <span style={{
                padding: '3px 8px', borderRadius: 5, fontSize: '0.62rem',
                fontWeight: 600, color: 'var(--text-faint)', background: 'var(--bg-warm)',
              }}>
                +{totalSkills - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Users Lookup ────────────────────────────────────────────────────────────

export default function UsersLookup() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  const fetchUsers = useCallback(async (searchTerm, pageNum) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      params.set('page', String(pageNum));
      params.set('limit', '24');
      const { data } = await api.get(`/api/v1/discover/users?${params}`);
      setUsers(data.users || []);
      setPagination(data.pagination);
      if (data.currentUserId) setCurrentUserId(data.currentUserId);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers('', 1);
  }, [fetchUsers]);

  const handleSearch = (value) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(value, 1);
    }, 300);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchUsers(search, newPage);
  };

  return (
    <div style={{ width: '100%', maxWidth: 880, margin: '0 auto' }}>
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        style={{ marginBottom: 20 }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 16px', borderRadius: 14,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-soft)',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, university, or bio..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: 'inherit', fontSize: '0.86rem', color: 'var(--text-dark)',
            }}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); fetchUsers('', 1); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-faint)', padding: 2, display: 'flex',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        {pagination && !loading && (
          <div style={{
            fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 8,
            paddingLeft: 4, fontWeight: 500,
          }}>
            {pagination.total} {pagination.total === 1 ? 'member' : 'members'}
            {search && ' found'}
          </div>
        )}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 12,
        }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} style={{
              borderRadius: 16, background: 'var(--bg-card)',
              border: '1px solid var(--border)', overflow: 'hidden',
            }}>
              <div style={{ height: 4, background: 'var(--bg-warm)' }} />
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: 'var(--bg-warm)', flexShrink: 0,
                    animation: 'pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.08}s`,
                  }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ height: 12, width: '60%', borderRadius: 6, background: 'var(--bg-warm)', animation: 'pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.08}s` }} />
                    <div style={{ height: 10, width: '45%', borderRadius: 6, background: 'var(--bg-warm)', animation: 'pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.12}s` }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[48, 56, 40].map((w, j) => (
                    <div key={j} style={{
                      height: 18, width: w, borderRadius: 5, background: 'var(--bg-warm)',
                      animation: 'pulse 1.8s ease-in-out infinite', animationDelay: `${(i + j) * 0.06}s`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '48px 24px' }}
        >
          <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>
            {search ? '\uD83D\uDD0D' : '\uD83C\uDF1F'}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>
            {search ? 'No results' : 'No members yet'}
          </h3>
          <p style={{ color: 'var(--text-soft)', fontSize: '0.82rem', margin: 0 }}>
            {search ? 'Try a different search term' : 'Check back later for new members'}
          </p>
        </motion.div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 12,
          }}>
            {users.map((user, i) => {
              const isSelf = user.id === currentUserId;
              return (
                <UserCard
                  key={user.id}
                  user={user}
                  index={i}
                  isSelf={isSelf}
                  onClick={() => navigate(isSelf ? '/profile' : `/user/${user.id}`)}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, marginTop: 24, paddingBottom: 8,
            }}>
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                style={{
                  padding: '7px 16px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg-card)',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.4 : 1,
                  fontFamily: 'inherit', fontSize: '0.76rem', fontWeight: 600,
                  color: 'var(--text-body)',
                }}
              >
                Previous
              </button>
              <span style={{
                fontSize: '0.76rem', color: 'var(--text-soft)', fontWeight: 600,
                padding: '0 4px',
              }}>
                {page} / {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
                style={{
                  padding: '7px 16px', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'var(--bg-card)',
                  cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= pagination.totalPages ? 0.4 : 1,
                  fontFamily: 'inherit', fontSize: '0.76rem', fontWeight: 600,
                  color: 'var(--text-body)',
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
