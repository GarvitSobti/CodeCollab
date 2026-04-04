import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function CreateTeamModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [hackathonId, setHackathonId] = useState('');
  const [hackathons, setHackathons] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all hackathons and the user's interests, then show only interested ones
    Promise.all([
      api.get('/api/v1/hackathons'),
      api.get('/api/v1/hackathons/me/interests').catch(() => ({ data: { hackathonIds: [] } })),
    ]).then(([hackRes, interestRes]) => {
      const interestedIds = new Set(interestRes.data.hackathonIds || []);
      const all = hackRes.data.hackathons || [];
      setHackathons(all.filter((h) => interestedIds.has(h.id)));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !hackathonId) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/api/v1/teams', { name: name.trim(), hackathonId });
      onCreated(res.data.team);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-heavy)' }}
      >
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>Create a Team</h2>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-body)' }}>
            Team Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Team Alpha"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--border)',
              background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.88rem', marginBottom: 16,
              outline: 'none', color: 'var(--text-dark)', boxSizing: 'border-box',
            }}
          />

          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-body)' }}>
            Hackathon
          </label>
          <select
            value={hackathonId}
            onChange={(e) => setHackathonId(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--border)',
              background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.88rem', marginBottom: 16,
              outline: 'none', color: 'var(--text-dark)', boxSizing: 'border-box',
            }}
          >
            <option value="">Select a hackathon...</option>
            {hackathons.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>

          {error && (
            <p style={{ fontSize: '0.8rem', color: 'var(--accent)', marginBottom: 12 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-soft)', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !hackathonId}
              style={{
                padding: '10px 24px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700,
                border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer',
                fontFamily: 'inherit', opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
