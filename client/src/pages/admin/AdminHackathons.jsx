import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';

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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', padding: '12px 14px', fontSize: '0.74rem', color: 'var(--text-soft)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <span>Event</span><span>Status</span><span>Venue</span><span>Actions</span>
        </div>

        {loading ? <div style={{ padding: 16 }}>Loading...</div> : hackathons.map((hackathon) => (
          <div key={hackathon.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', padding: '14px', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{hackathon.eventName}</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.75rem' }}>{hackathon.registrationStartDate} to {hackathon.registrationEndDate}</div>
              <div style={{ color: 'var(--text-soft)', fontSize: '0.72rem', marginTop: 3 }}>{(hackathon.categories || []).join(' · ')}</div>
            </div>
            <div style={{ fontSize: '0.78rem' }}>{hackathon.status}</div>
            <div style={{ fontSize: '0.78rem' }}>{hackathon.venue}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Link to={`/admin/hackathons/${hackathon.id}/edit`} style={{ fontSize: '0.78rem' }}>Edit</Link>
              <Link to={`/admin/analytics/${hackathon.id}`} style={{ fontSize: '0.78rem' }}>Analytics</Link>
              <button onClick={() => runAction(() => adminApi.publishHackathon(hackathon.id))} style={{ fontSize: '0.72rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, background: 'white', cursor: 'pointer' }}>Publish</button>
              <button onClick={() => runAction(() => adminApi.cloneHackathon(hackathon.id))} style={{ fontSize: '0.72rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, background: 'white', cursor: 'pointer' }}>Clone</button>
              <button onClick={() => runAction(() => adminApi.archiveHackathon(hackathon.id))} style={{ fontSize: '0.72rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, background: 'white', cursor: 'pointer' }}>Archive</button>
              <button onClick={() => runAction(() => adminApi.deleteHackathon(hackathon.id))} style={{ fontSize: '0.72rem', border: '1px solid rgba(255,107,107,0.4)', color: 'var(--coral)', borderRadius: 8, background: 'white', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
