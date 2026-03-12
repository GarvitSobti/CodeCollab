import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';

export default function AdminCompanyProfile() {
  const [form, setForm] = useState({
    name: '',
    website: '',
    email: '',
    logoUrl: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    adminApi.me().then((response) => {
      if (response.company) {
        setForm({
          name: response.company.name || '',
          website: response.company.website || '',
          email: response.company.email || '',
          logoUrl: response.company.logoUrl || '',
          description: response.company.description || ''
        });
      }
    });
  }, []);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSavedMessage('');
    try {
      const response = await adminApi.updateCompanyProfile(form);
      localStorage.setItem('admin_company', JSON.stringify(response.company));
      setSavedMessage('Company profile updated successfully.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h2 style={{ fontSize: '1.35rem', marginBottom: 14 }}>Company Profile</h2>
      <form onSubmit={onSubmit} style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 16, display: 'grid', gap: 12 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', lineHeight: 1.5 }}>
          Manage the public-facing company details that participants and reviewers see across your admin and event experiences.
        </p>

        <label style={labelStyle}>Company name</label>
        <input value={form.name} onChange={(event) => handleChange('name', event.target.value)} style={inputStyle} />

        <label style={labelStyle}>Website</label>
        <input value={form.website} onChange={(event) => handleChange('website', event.target.value)} style={inputStyle} />

        <label style={labelStyle}>Contact email</label>
        <input value={form.email} onChange={(event) => handleChange('email', event.target.value)} style={inputStyle} />

        <label style={labelStyle}>Logo URL</label>
        <input value={form.logoUrl} onChange={(event) => handleChange('logoUrl', event.target.value)} style={inputStyle} />

        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={(event) => handleChange('description', event.target.value)} rows={4} style={inputStyle} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="submit" disabled={saving} style={buttonStyle}>{saving ? 'Saving...' : 'Save Profile'}</button>
          {savedMessage && <span style={{ fontSize: '0.78rem', color: 'var(--mint)' }}>{savedMessage}</span>}
        </div>
      </form>
    </AdminLayout>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(0,0,0,0.14)',
  font: 'inherit'
};

const labelStyle = {
  fontSize: '0.76rem',
  color: 'var(--text-body)',
  fontWeight: 600,
  marginBottom: -4
};

const buttonStyle = {
  width: 180,
  padding: '11px 14px',
  borderRadius: 10,
  border: 'none',
  color: 'white',
  background: 'linear-gradient(135deg, var(--peach), var(--coral))',
  cursor: 'pointer'
};
