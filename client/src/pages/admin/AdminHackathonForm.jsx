import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';

const initialForm = {
  eventName: '',
  description: '',
  registrationStartDate: '',
  registrationEndDate: '',
  hackathonStartDate: '',
  hackathonEndDate: '',
  venue: 'VIRTUAL',
  teamSizeMin: 1,
  teamSizeMax: 5,
  categoriesText: '',
  registrationRequirementsText: '',
  status: 'DRAFT'
};

export default function AdminHackathonForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = useMemo(() => id && id !== 'new', [id]);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    adminApi.listHackathons().then((response) => {
      const hackathon = (response.data || []).find((item) => item.id === id);
      if (!hackathon) return;
      setForm({
        eventName: hackathon.eventName || '',
        description: hackathon.description || '',
        registrationStartDate: hackathon.registrationStartDate || '',
        registrationEndDate: hackathon.registrationEndDate || '',
        hackathonStartDate: hackathon.hackathonStartDate || '',
        hackathonEndDate: hackathon.hackathonEndDate || '',
        venue: hackathon.venue || 'VIRTUAL',
        teamSizeMin: hackathon.teamSizeMin || 1,
        teamSizeMax: hackathon.teamSizeMax || 5,
        categoriesText: (hackathon.categories || []).join(', '),
        registrationRequirementsText: (hackathon.registrationRequirements || []).join(', '),
        status: hackathon.status || 'DRAFT'
      });
    });
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        eventName: form.eventName,
        description: form.description,
        registrationStartDate: form.registrationStartDate,
        registrationEndDate: form.registrationEndDate,
        hackathonStartDate: form.hackathonStartDate,
        hackathonEndDate: form.hackathonEndDate,
        venue: form.venue,
        teamSizeMin: Number(form.teamSizeMin),
        teamSizeMax: Number(form.teamSizeMax),
        categories: form.categoriesText.split(',').map((item) => item.trim()).filter(Boolean),
        registrationRequirements: form.registrationRequirementsText.split(',').map((item) => item.trim()).filter(Boolean),
        status: form.status,
        prizes: [],
        sponsors: [],
        faq: []
      };

      if (isEdit) {
        await adminApi.updateHackathon(id, payload);
      } else {
        await adminApi.createHackathon(payload);
      }
      navigate('/admin/hackathons');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h2 style={{ fontSize: '1.35rem', marginBottom: 16 }}>{isEdit ? 'Edit Hackathon' : 'Create Hackathon'}</h2>

      <form onSubmit={onSubmit} style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 16, display: 'grid', gap: 12 }}>
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Basic Information</h3>
          <p style={sectionDescriptionStyle}>Define your event identity so students instantly understand the theme and value proposition.</p>

          <label style={labelStyle}>Event name</label>
          <input
            placeholder="e.g. InnovateX FutureBuild 2026"
            value={form.eventName}
            onChange={(event) => handleChange('eventName', event.target.value)}
            required
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: 10 }}>Event description</label>
          <textarea
            placeholder="Describe the challenge statement, audience, outcomes, and what makes this event unique."
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            rows={4}
            style={inputStyle}
          />
        </div>

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Schedule</h3>
          <p style={sectionDescriptionStyle}>Set registration and event timelines. These dates drive visibility and participant planning.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Registration start date</label>
              <input type="date" value={form.registrationStartDate} onChange={(event) => handleChange('registrationStartDate', event.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Registration end date</label>
              <input type="date" value={form.registrationEndDate} onChange={(event) => handleChange('registrationEndDate', event.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Hackathon start date</label>
              <input type="date" value={form.hackathonStartDate} onChange={(event) => handleChange('hackathonStartDate', event.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Hackathon end date</label>
              <input type="date" value={form.hackathonEndDate} onChange={(event) => handleChange('hackathonEndDate', event.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Format and Team Rules</h3>
          <p style={sectionDescriptionStyle}>Specify participation format and team size constraints to align submissions and judging criteria.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Venue mode</label>
              <select value={form.venue} onChange={(event) => handleChange('venue', event.target.value)} style={inputStyle}>
                <option value="VIRTUAL">Virtual</option>
                <option value="PHYSICAL">Physical</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Minimum team size</label>
              <input type="number" min={1} placeholder="e.g. 1" value={form.teamSizeMin} onChange={(event) => handleChange('teamSizeMin', event.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Maximum team size</label>
              <input type="number" min={1} placeholder="e.g. 5" value={form.teamSizeMax} onChange={(event) => handleChange('teamSizeMax', event.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Lifecycle status</label>
              <select value={form.status} onChange={(event) => handleChange('status', event.target.value)} style={inputStyle}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Tracks and Requirements</h3>
          <p style={sectionDescriptionStyle}>Add categories and signup requirements. Use comma-separated values for quick entry.</p>

          <label style={labelStyle}>Categories / Tracks</label>
          <input
            placeholder="e.g. AI/ML, Sustainability, FinTech"
            value={form.categoriesText}
            onChange={(event) => handleChange('categoriesText', event.target.value)}
            style={inputStyle}
          />
          <p style={helperStyle}>Tip: each comma creates one track entry.</p>

          <label style={{ ...labelStyle, marginTop: 8 }}>Registration requirements</label>
          <input
            placeholder="e.g. Student ID, Resume, GitHub profile"
            value={form.registrationRequirementsText}
            onChange={(event) => handleChange('registrationRequirementsText', event.target.value)}
            style={inputStyle}
          />
          <p style={helperStyle}>Tip: keep requirements concise and measurable for faster approvals.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button disabled={loading} type="submit" style={{
            width: 220,
            padding: '11px 14px',
            borderRadius: 10,
            border: 'none',
            color: 'white',
            background: 'linear-gradient(135deg, var(--peach), var(--coral))',
            cursor: 'pointer'
          }}>
            {loading ? 'Saving...' : (isEdit ? 'Update Hackathon' : 'Create Hackathon')}
          </button>
          <p style={helperStyle}>Draft mode is recommended while preparing final content and dates.</p>
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

const sectionStyle = {
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 10,
  padding: 12,
  background: '#fcfcfc'
};

const sectionTitleStyle = {
  fontSize: '0.94rem',
  fontWeight: 700,
  marginBottom: 4
};

const sectionDescriptionStyle = {
  fontSize: '0.76rem',
  color: 'var(--text-soft)',
  marginBottom: 10,
  lineHeight: 1.5
};

const labelStyle = {
  display: 'block',
  fontSize: '0.76rem',
  color: 'var(--text-body)',
  marginBottom: 5,
  fontWeight: 600
};

const helperStyle = {
  fontSize: '0.72rem',
  color: 'var(--text-soft)',
  lineHeight: 1.45
};
