import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function PendingInvites({ onRespond }) {
  const [invites, setInvites] = useState([]);
  const [respondingId, setRespondingId] = useState(null);

  useEffect(() => {
    api.get('/api/v1/teams/invites/pending')
      .then((res) => setInvites(res.data.invites || []))
      .catch(() => {});
  }, []);

  if (invites.length === 0) return null;

  const handleRespond = async (inviteId, accept) => {
    setRespondingId(inviteId);
    try {
      await api.post(`/api/v1/teams/invites/${inviteId}/respond`, { accept });
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      onRespond();
    } catch (err) {
      console.error('Failed to respond to invite:', err);
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div style={{ marginBottom: 24, padding: 20, borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,138,101,0.08), rgba(66,165,245,0.06))', border: '1px solid rgba(255,138,101,0.2)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>📨 Pending Team Invites</h3>
      {invites.map((inv) => (
        <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{inv.team?.name}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginLeft: 8 }}>
              from {inv.fromUser?.name || 'someone'}
            </span>
          </div>
          <button
            disabled={respondingId === inv.id}
            onClick={() => handleRespond(inv.id, true)}
            style={{
              padding: '6px 16px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700,
              border: 'none', background: 'var(--accent)', color: 'white', cursor: 'pointer',
              fontFamily: 'inherit', opacity: respondingId === inv.id ? 0.6 : 1,
            }}
          >
            Accept
          </button>
          <button
            disabled={respondingId === inv.id}
            onClick={() => handleRespond(inv.id, false)}
            style={{
              padding: '6px 16px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700,
              border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-soft)',
              cursor: 'pointer', fontFamily: 'inherit', opacity: respondingId === inv.id ? 0.6 : 1,
            }}
          >
            Decline
          </button>
        </div>
      ))}
    </div>
  );
}
