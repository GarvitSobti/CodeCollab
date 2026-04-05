import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { getApiOrigin } from '../../utils/runtimeConfig';

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
  prizesText: '',
  sponsorsText: '',
  faqText: '',
  status: 'DRAFT'
};

export default function AdminHackathonForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = useMemo(() => id && id !== 'new', [id]);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

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
        prizesText: (hackathon.prizes || []).map((item) => `${item.title}:${item.amount}`).join(', '),
        sponsorsText: (hackathon.sponsors || []).map((item) => `${item.name}|${item.link}|${item.logoUrl || ''}`).join(', '),
        faqText: (hackathon.faq || []).map((item) => `${item.question}?${item.answer}`).join(' || '),
        status: hackathon.status || 'DRAFT'
      });
    });
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSponsorLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setUploadMessage('Uploading sponsor logo...');
    try {
      const response = await adminApi.uploadSponsorLogo(file);
      const uploadedPath = response?.data?.path || '';
      if (uploadedPath) {
        const absolutePath = `${getApiOrigin()}${uploadedPath}`;
        setForm((previous) => {
          const current = (previous.sponsorsText || '').trim();
          const updated = current
            ? `${current}, Sponsor Name|https://sponsor.link|${absolutePath}`
            : `Sponsor Name|https://sponsor.link|${absolutePath}`;
          return { ...previous, sponsorsText: updated };
        });
        setUploadMessage('Logo uploaded. Update sponsor name/link as needed.');
      } else {
        setUploadMessage('Upload completed but no path returned.');
      }
    } catch (error) {
      setUploadMessage(error?.response?.data?.message || 'Failed to upload sponsor logo.');
    } finally {
      setUploadingLogo(false);
      event.target.value = '';
    }
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
        prizes: form.prizesText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => {
            const [title, amount] = item.split(':').map((value) => value.trim());
            return { title, amount: Number(amount || 0) };
          }),
        sponsors: form.sponsorsText
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => {
            const [name, link, logoUrl] = item.split('|').map((value) => value.trim());
            return { name, link, logoUrl: logoUrl || '' };
          }),
        faq: form.faqText
          .split('||')
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => {
            const [question, answer] = item.split('?').map((value) => value.trim());
            return { question: `${question}?`, answer: answer || '' };
          })
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

        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Prizes, Sponsors and FAQ</h3>
          <p style={sectionDescriptionStyle}>Capture the additional event context companies need before publishing. Simple text formats are supported for now.</p>

          <label style={labelStyle}>Prizes</label>
          <input
            placeholder="e.g. Grand Prize:8000, Best UX:2000"
            value={form.prizesText}
            onChange={(event) => handleChange('prizesText', event.target.value)}
            style={inputStyle}
          />
          <p style={helperStyle}>Format each prize as title:amount.</p>

          <label style={{ ...labelStyle, marginTop: 8 }}>Sponsors</label>
          <input
            placeholder="e.g. CloudNova|https://cloudnova.example|https://logo.url/file.png"
            value={form.sponsorsText}
            onChange={(event) => handleChange('sponsorsText', event.target.value)}
            style={inputStyle}
          />
          <p style={helperStyle}>Format each sponsor as name|link|logoUrl.</p>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleSponsorLogoUpload} disabled={uploadingLogo} />
            <span style={helperStyle}>{uploadingLogo ? 'Uploading...' : uploadMessage || 'Secure upload: png/jpeg/webp up to 2MB.'}</span>
          </div>

          <label style={{ ...labelStyle, marginTop: 8 }}>FAQ</label>
          <textarea
            placeholder="e.g. Who can join? University students only || Is submission required? Yes, before the final showcase"
            value={form.faqText}
            onChange={(event) => handleChange('faqText', event.target.value)}
            rows={3}
            style={inputStyle}
          />
          <p style={helperStyle}>Separate each FAQ item with || and use one ? to split question and answer.</p>
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
