import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';

const actionButtonStyle = {
  minWidth: 78,
  padding: '7px 10px',
  fontSize: '0.72rem',
  fontWeight: 700,
  borderRadius: 10,
  border: '1px solid rgba(0,0,0,0.08)',
  background: 'linear-gradient(180deg, #ffffff 0%, #fff7f4 100%)',
  boxShadow: '0 10px 24px rgba(255, 138, 101, 0.12)',
  color: 'var(--text-dark)',
  cursor: 'pointer',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease'
};

const publishButtonStyle = {
  ...actionButtonStyle,
  background: 'linear-gradient(135deg, var(--peach), var(--coral))',
  color: 'white',
  border: 'none',
  boxShadow: '0 14px 28px rgba(255, 107, 107, 0.22)'
};

const deleteButtonStyle = {
  ...actionButtonStyle,
  background: 'linear-gradient(180deg, #fff 0%, #fff2f2 100%)',
  color: 'var(--coral)',
  border: '1px solid rgba(255,107,107,0.28)',
  boxShadow: '0 10px 24px rgba(255, 107, 107, 0.12)'
};

export default function AdminHackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await adminApi.listHackathons();
      setHackathons(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runAction = async (action) => {
    await action();
    await load();
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.35rem' }}>Manage Hackathons</h2>
        <Link to="/admin/hackathons/new" style={{ textDecoration: 'none', color: 'white', background: 'linear-gradient(135deg, var(--peach), var(--coral))', borderRadius: 10, padding: '10px 12px', fontSize: '0.82rem' }}>
          + Create Event
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 0.9fr 2.1fr', padding: '12px 14px', fontSize: '0.74rem', color: 'var(--text-soft)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <span>Event</span><span>Status</span><span>Venue</span><span>Actions</span>
        </div>

        {loading ? <div style={{ padding: 16 }}>Loading...</div> : hackathons.map((hackathon) => (
          <div key={hackathon.id} style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 0.9fr 2.1fr', padding: '18px 14px', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: 6 }}>{hackathon.eventName}</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.78rem' }}>{hackathon.registrationStartDate} to {hackathon.registrationEndDate}</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.74rem', marginTop: 5 }}>{(hackathon.categories || []).join(' · ')}</div>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-body)' }}>{hackathon.status}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-body)' }}>{hackathon.venue}</div>
            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 8, justifyContent: 'flex-start', alignItems: 'center' }}>
              <button onClick={() => runAction(() => adminApi.publishHackathon(hackathon.id))} style={publishButtonStyle}>Publish</button>
              <button onClick={() => runAction(() => adminApi.cloneHackathon(hackathon.id))} style={actionButtonStyle}>Clone</button>
              <button onClick={() => runAction(() => adminApi.archiveHackathon(hackathon.id))} style={actionButtonStyle}>Archive</button>
              <button onClick={() => runAction(() => adminApi.deleteHackathon(hackathon.id))} style={deleteButtonStyle}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
