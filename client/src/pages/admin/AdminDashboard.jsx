import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';

export default function AdminDashboard() {
  const [hackathons, setHackathons] = useState([]);

  useEffect(() => {
    adminApi.listHackathons().then((response) => {
      setHackathons(response.data || []);
    }).catch(() => {
      setHackathons([]);
    });
  }, []);

  const stats = useMemo(() => {
    const total = hackathons.length;
    const published = hackathons.filter((hackathon) => hackathon.status === 'PUBLISHED').length;
    const draft = hackathons.filter((hackathon) => hackathon.status === 'DRAFT').length;
    const archived = hackathons.filter((hackathon) => hackathon.status === 'ARCHIVED').length;
    return { total, published, draft, archived };
  }, [hackathons]);

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontSize: '1.4rem' }}>Admin Dashboard</h2>
        <Link to="/admin/hackathons/new" style={{
          textDecoration: 'none',
          color: 'white',
          background: 'linear-gradient(135deg, var(--peach), var(--coral))',
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: '0.82rem'
        }}>
          + New Hackathon
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Total Events', value: stats.total },
          { label: 'Published', value: stats.published },
          { label: 'Drafts', value: stats.draft },
          { label: 'Archived', value: stats.archived }
        ].map((item) => (
          <div key={item.label} style={{ background: 'white', borderRadius: 12, padding: 14, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ color: 'var(--text-soft)', fontSize: '0.75rem' }}>{item.label}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Recent Hackathons</h3>
        {hackathons.map((hackathon) => (
          <div key={hackathon.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{hackathon.eventName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>{hackathon.venue} · {hackathon.status}</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to={`/admin/hackathons/${hackathon.id}/edit`} style={{ fontSize: '0.8rem' }}>Edit</Link>
              <Link to={`/admin/analytics/${hackathon.id}`} style={{ fontSize: '0.8rem' }}>Analytics</Link>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
