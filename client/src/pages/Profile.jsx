import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const SECTIONS = ['Welcome Setup', 'About You', 'Your Skills', 'Your Preferred Skills'];

const PROFICIENCY_LEVELS = [
  { value: 1, label: 'Beginner', description: 'Can follow guides and complete simple tasks with help.' },
  { value: 2, label: 'Elementary', description: 'Can build basic features with occasional guidance.' },
  { value: 3, label: 'Intermediate', description: 'Can work independently on common tasks.' },
  { value: 4, label: 'Advanced', description: 'Can handle complex tasks and debug confidently.' },
  { value: 5, label: 'Expert', description: 'Can architect solutions and mentor others.' },
];

function defaultAssessment() {
  return {
    mcq: {
      rolePreference: '',
      strongestArea: '',
      comfortAmbiguity: '',
      debuggingApproach: '',
      teamworkStyle: '',
    },
    sliders: {
      buildSpeed: 3,
      systemDesign: 3,
      debugging: 3,
      collaboration: 3,
      learningVelocity: 3,
    },
    caseBased: {
      mvpTradeoff: '',
      prodIncident: '',
    },
  };
}

function createDefaultProfile(authUser) {
  return {
    firebaseUid: authUser?.uid || '',
    email: authUser?.email || '',
    personal: {
      fullName: authUser?.displayName || authUser?.email || '',
      displayName: authUser?.displayName || '',
      name: authUser?.displayName || authUser?.email || '',
      university: '',
      year: '',
      major: '',
    },
    bio: '',
    projectExperience: [{ title: '', description: '', url: '', technologies: '' }],
    workExperience: [{ company: '', role: '', duration: '', description: '' }],
    skills: [{ name: '', level: 1 }],
    preferredSkills: [{ name: '' }],
    assessment: defaultAssessment(),
    hackathonExperience: {
      count: 0,
      summary: '',
    },
    social: {
      github: '',
      linkedin: '',
    },
    portfolioLinks: [{ label: 'Project', url: '' }],
    privacy: {
      showEmail: false,
      showPortfolio: true,
      discoverable: true,
    },
    verification: {
      githubVerified: false,
      linkedinVerified: false,
      universityVerified: false,
    },
    onboardingCompleted: false,
    completion: 0,
  };
}

function normalizeIncomingProfile(data, authUser) {
  const base = createDefaultProfile(authUser);
  return {
    ...base,
    ...data,
    personal: {
      ...base.personal,
      ...(data?.personal || {}),
      fullName: data?.personal?.fullName || data?.personal?.name || base.personal.fullName,
      displayName: data?.personal?.displayName || data?.personal?.name || base.personal.displayName,
    },
    assessment: {
      ...base.assessment,
      ...(data?.assessment || {}),
      mcq: {
        ...base.assessment.mcq,
        ...(data?.assessment?.mcq || {}),
      },
      sliders: {
        ...base.assessment.sliders,
        ...(data?.assessment?.sliders || {}),
      },
      caseBased: {
        ...base.assessment.caseBased,
        ...(data?.assessment?.caseBased || {}),
      },
    },
    hackathonExperience: {
      ...base.hackathonExperience,
      ...(data?.hackathonExperience || {}),
    },
    social: {
      ...base.social,
      ...(data?.social || {}),
    },
    privacy: {
      ...base.privacy,
      ...(data?.privacy || {}),
    },
    verification: {
      ...base.verification,
      ...(data?.verification || {}),
    },
    bio: data?.bio || base.bio,
    projectExperience:
      Array.isArray(data?.projectExperience) && data.projectExperience.length
        ? data.projectExperience
        : base.projectExperience,
    workExperience:
      Array.isArray(data?.workExperience) && data.workExperience.length
        ? data.workExperience
        : base.workExperience,
    skills: Array.isArray(data?.skills) && data.skills.length ? data.skills : base.skills,
    preferredSkills:
      Array.isArray(data?.interests) && data.interests.length
        ? data.interests.map((item) => ({ name: item }))
        : base.preferredSkills,
    portfolioLinks:
      Array.isArray(data?.portfolioLinks) && data.portfolioLinks.length
        ? data.portfolioLinks
        : base.portfolioLinks,
  };
}

function canFinishOnboarding(profile) {
  const hasBasics = Boolean(
    profile.personal.fullName &&
    profile.personal.displayName &&
    profile.personal.university &&
    profile.personal.year &&
    profile.personal.major
  );
  const hasSkill = profile.skills.some((skill) => skill.name.trim());
  const hasPreferredSkill = profile.preferredSkills.some((skill) => skill.name.trim());
  return hasBasics && hasSkill && hasPreferredSkill;
}

export default function Profile() {
  const { user, refreshOnboardingStatus } = useAuth();
  const [profile, setProfile] = useState(() => createDefaultProfile(user));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await api.get('/api/v1/profile/me');
        if (!active) return;
        setProfile(normalizeIncomingProfile(response?.data?.profile, user));
      } catch (error) {
        if (!active) return;
        setProfile(createDefaultProfile(user));
        setErrorMessage(
          error?.response?.data?.error?.message || 'Could not load profile, but you can continue editing.'
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  const updateProfile = (updater) => {
    setProfile((previous) => {
      const next = typeof updater === 'function' ? updater(previous) : updater;
      return next;
    });
  };

  const handleSkillChange = (index, key, value) => {
    updateProfile((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, skillIndex) =>
        skillIndex === index
          ? {
              ...skill,
              [key]: key === 'level' ? Number(value) : value,
            }
          : skill
      ),
    }));
  };

  const addSkill = () => {
    updateProfile((prev) => ({ ...prev, skills: [...prev.skills, { name: '', level: 1 }] }));
  };

  const removeSkill = (index) => {
    updateProfile((prev) => ({
      ...prev,
      skills:
        prev.skills.length === 1
          ? prev.skills
          : prev.skills.filter((_, skillIndex) => skillIndex !== index),
    }));
  };

  const addPreferredSkill = () => {
    updateProfile((prev) => ({ ...prev, preferredSkills: [...prev.preferredSkills, { name: '' }] }));
  };

  const removePreferredSkill = (index) => {
    updateProfile((prev) => ({
      ...prev,
      preferredSkills:
        prev.preferredSkills.length === 1
          ? prev.preferredSkills
          : prev.preferredSkills.filter((_, skillIndex) => skillIndex !== index),
    }));
  };

  const saveProfile = async (markOnboardingComplete) => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const preferredSkills = profile.preferredSkills
        .map((item) => item.name.trim())
        .filter(Boolean);

      const payload = {
        ...profile,
        personal: {
          ...profile.personal,
          name: profile.personal.displayName || profile.personal.fullName,
        },
        interests: preferredSkills,
        onboardingCompleted: markOnboardingComplete ? true : profile.onboardingCompleted,
      };

      const response = await api.put('/api/v1/profile/me', payload);
      setProfile(normalizeIncomingProfile(response?.data?.profile, user));
      await refreshOnboardingStatus();
      setSuccessMessage(markOnboardingComplete ? 'Profile updated.' : 'Draft saved.');
    } catch (error) {
      setErrorMessage(error?.response?.data?.error?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <div className="mesh-bg"><div className="mesh-blob blob-1" /><div className="mesh-blob blob-2" /><div className="mesh-blob blob-3" /></div>
        <div className="noise" />
        <Navigation />
        <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
          <p style={{ color: 'var(--text-soft)', fontWeight: 700 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="mesh-bg"><div className="mesh-blob blob-1" /><div className="mesh-blob blob-2" /><div className="mesh-blob blob-3" /></div>
      <div className="noise" />
      <Navigation />

      <div style={{ position: 'relative', zIndex: 2, padding: '100px 40px 60px', maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            {profile.onboardingCompleted ? 'Profile Setup' : 'Complete Your Profile'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', marginBottom: 10 }}>
            Keep your profile aligned with registration details for better teammate matching.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
          <div style={{ borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)', padding: 16, height: 'fit-content' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>Sections</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {SECTIONS.map((section, idx) => (
                <div
                  key={section}
                  style={{
                    textAlign: 'left',
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: 'var(--bg)',
                    color: 'var(--text-body)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  {idx + 1}. {section}
                </div>
              ))}
            </div>

            <div style={{ borderRadius: 12, padding: 12, background: 'var(--bg)' }}>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-soft)', lineHeight: 1.6 }}>
                Skill levels use the same standardized scale as registration.
              </p>
            </div>
          </div>

          <div style={{ borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)', padding: 22 }}>
            {errorMessage && <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,138,101,0.12)', color: 'var(--coral)', fontSize: '0.78rem', fontWeight: 600 }}>{errorMessage}</p>}
            {successMessage && <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 10, background: 'rgba(102,187,106,0.12)', color: 'var(--mint)', fontSize: '0.78rem', fontWeight: 600 }}>{successMessage}</p>}

            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Keep your profile details current</h2>  
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'fullName', label: 'Full Name' },
                  { key: 'displayName', label: 'Display Name' },
                  { key: 'university', label: 'University' },
                  { key: 'year', label: 'Year', type: 'number', min: 1, max: 10, step: 1 },
                  { key: 'major', label: 'Major' },
                ].map((field) => (
                  <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-soft)' }}>{field.label}</span>
                    <input
                      type={field.type || 'text'}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      inputMode={field.key === 'year' ? 'numeric' : undefined}
                      value={profile.personal[field.key]}
                      onChange={(event) => {
                        const nextValue = field.key === 'year'
                          ? event.target.value.replace(/\D/g, '')
                          : event.target.value;

                        updateProfile((prev) => ({
                          ...prev,
                          personal: {
                            ...prev.personal,
                            [field.key]: nextValue,
                          },
                        }));
                      }}
                      onBlur={(event) => {
                        if (field.key !== 'year' || !event.target.value) {
                          return;
                        }

                        const parsed = Number.parseInt(event.target.value, 10);
                        const normalized = Number.isFinite(parsed)
                          ? String(Math.min(10, Math.max(1, parsed)))
                          : '1';

                        if (normalized !== profile.personal.year) {
                          updateProfile((prev) => ({
                            ...prev,
                            personal: {
                              ...prev.personal,
                              year: normalized,
                            },
                          }));
                        }
                      }}
                      style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>About You</h2>
              <p style={{ marginTop: 0, fontSize: '0.78rem', color: 'var(--text-soft)', marginBottom: 14 }}>
                A short introduction, your project experience, and work experience.
              </p>

              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-soft)' }}>Short Introduction</span>
                <textarea
                  value={profile.bio}
                  onChange={(e) => updateProfile((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell potential teammates a bit about yourself..."
                  rows={3}
                  style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem', resize: 'vertical' }}
                />
              </label>

              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Project Experience</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                {profile.projectExperience.map((proj, index) => (
                  <div key={`proj-${index}`} style={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 14, background: 'var(--bg)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <input
                        value={proj.title}
                        onChange={(e) => updateProfile((prev) => ({ ...prev, projectExperience: prev.projectExperience.map((p, i) => i === index ? { ...p, title: e.target.value } : p) }))}
                        placeholder="Project title"
                        style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                      />
                      <input
                        value={proj.technologies}
                        onChange={(e) => updateProfile((prev) => ({ ...prev, projectExperience: prev.projectExperience.map((p, i) => i === index ? { ...p, technologies: e.target.value } : p) }))}
                        placeholder="Technologies (e.g. React, Node.js)"
                        style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                      />
                    </div>
                    <input
                      value={proj.url}
                      onChange={(e) => updateProfile((prev) => ({ ...prev, projectExperience: prev.projectExperience.map((p, i) => i === index ? { ...p, url: e.target.value } : p) }))}
                      placeholder="Project URL (optional)"
                      style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', marginBottom: 8 }}
                    />
                    <textarea
                      value={proj.description}
                      onChange={(e) => updateProfile((prev) => ({ ...prev, projectExperience: prev.projectExperience.map((p, i) => i === index ? { ...p, description: e.target.value } : p) }))}
                      placeholder="Brief description of what you built and your role"
                      rows={2}
                      style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', resize: 'vertical' }}
                    />
                    <div style={{ textAlign: 'right', marginTop: 6 }}>
                      <button type="button" onClick={() => updateProfile((prev) => ({ ...prev, projectExperience: prev.projectExperience.length === 1 ? prev.projectExperience : prev.projectExperience.filter((_, i) => i !== index) }))} disabled={profile.projectExperience.length === 1} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', background: 'none', border: 'none', cursor: profile.projectExperience.length === 1 ? 'not-allowed' : 'pointer' }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => updateProfile((prev) => ({ ...prev, projectExperience: [...prev.projectExperience, { title: '', description: '', url: '', technologies: '' }] }))} style={{ borderRadius: 10, border: '1px dashed rgba(0,0,0,0.15)', background: 'transparent', padding: '8px 12px', color: 'var(--text-soft)', fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}>
                + Add Project
              </button>

              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Work Experience</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
                {profile.workExperience.map((work, index) => (
                  <div key={`work-${index}`} style={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: 14, background: 'var(--bg)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <input
                        value={work.company}
                        onChange={(e) => updateProfile((prev) => ({ ...prev, workExperience: prev.workExperience.map((w, i) => i === index ? { ...w, company: e.target.value } : w) }))}
                        placeholder="Company / Organisation"
                        style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                      />
                      <input
                        value={work.role}
                        onChange={(e) => updateProfile((prev) => ({ ...prev, workExperience: prev.workExperience.map((w, i) => i === index ? { ...w, role: e.target.value } : w) }))}
                        placeholder="Role / Title"
                        style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                      />
                    </div>
                    <input
                      value={work.duration}
                      onChange={(e) => updateProfile((prev) => ({ ...prev, workExperience: prev.workExperience.map((w, i) => i === index ? { ...w, duration: e.target.value } : w) }))}
                      placeholder="Duration (e.g. Jun 2025 - Aug 2025)"
                      style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', marginBottom: 8 }}
                    />
                    <textarea
                      value={work.description}
                      onChange={(e) => updateProfile((prev) => ({ ...prev, workExperience: prev.workExperience.map((w, i) => i === index ? { ...w, description: e.target.value } : w) }))}
                      placeholder="Brief description of your responsibilities"
                      rows={2}
                      style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', resize: 'vertical' }}
                    />
                    <div style={{ textAlign: 'right', marginTop: 6 }}>
                      <button type="button" onClick={() => updateProfile((prev) => ({ ...prev, workExperience: prev.workExperience.length === 1 ? prev.workExperience : prev.workExperience.filter((_, i) => i !== index) }))} disabled={profile.workExperience.length === 1} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', background: 'none', border: 'none', cursor: profile.workExperience.length === 1 ? 'not-allowed' : 'pointer' }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => updateProfile((prev) => ({ ...prev, workExperience: [...prev.workExperience, { company: '', role: '', duration: '', description: '' }] }))} style={{ borderRadius: 10, border: '1px dashed rgba(0,0,0,0.15)', background: 'transparent', padding: '8px 12px', color: 'var(--text-soft)', fontWeight: 600, cursor: 'pointer' }}>
                + Add Work Experience
              </button>
            </div>

            <div style={{ marginTop: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Your Skills</h2>
              <p style={{ marginTop: 0, fontSize: '0.78rem', color: 'var(--text-soft)', marginBottom: 14 }}>
                Add your skills and rate your proficiency from 1 to 5.
              </p>

              <div style={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'var(--bg)', padding: 12, marginBottom: 12 }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-body)' }}>Standard proficiency scale (1-5)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                  {PROFICIENCY_LEVELS.map((level) => (
                    <div key={level.value} style={{ fontSize: '0.72rem', color: 'var(--text-soft)', lineHeight: 1.45 }}>
                      <strong style={{ color: 'var(--text-body)' }}>{`${level.value} - ${level.label}: `}</strong>
                      {level.description}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                {profile.skills.map((skill, index) => (
                  <div key={`skill-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 230px 80px', gap: 8 }}>
                    <input
                      value={skill.name}
                      onChange={(event) => handleSkillChange(index, 'name', event.target.value)}
                      placeholder="Skill name"
                      style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                    />
                    <select
                      value={skill.level}
                      onChange={(event) => handleSkillChange(index, 'level', event.target.value)}
                      style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                    >
                      {PROFICIENCY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>{`${level.value} - ${level.label}`}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      disabled={profile.skills.length === 1}
                      style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'var(--bg-card)', fontFamily: 'inherit', fontWeight: 700, color: 'var(--text-soft)', cursor: profile.skills.length === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addSkill} style={{ borderRadius: 10, border: '1px dashed rgba(0,0,0,0.15)', background: 'transparent', padding: '8px 12px', color: 'var(--text-soft)', fontWeight: 600, cursor: 'pointer' }}>
                + Add Skill
              </button>
            </div>

            <div style={{ marginTop: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Your Preferred Skills</h2>
              <p style={{ marginTop: 0, fontSize: '0.78rem', color: 'var(--text-soft)', marginBottom: 14 }}>
                Add the skills you want in teammates. No proficiency rating is needed.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                {profile.preferredSkills.map((skill, index) => (
                  <div key={`preferred-skill-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
                    <input
                      value={skill.name}
                      onChange={(event) =>
                        updateProfile((prev) => ({
                          ...prev,
                          preferredSkills: prev.preferredSkills.map((entry, skillIndex) =>
                            skillIndex === index
                              ? {
                                  ...entry,
                                  name: event.target.value,
                                }
                              : entry
                          ),
                        }))
                      }
                      placeholder="Preferred skill"
                      style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => removePreferredSkill(index)}
                      disabled={profile.preferredSkills.length === 1}
                      style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'var(--bg-card)', fontFamily: 'inherit', fontWeight: 700, color: 'var(--text-soft)', cursor: profile.preferredSkills.length === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addPreferredSkill}
                style={{ borderRadius: 10, border: '1px dashed rgba(0,0,0,0.15)', background: 'transparent', padding: '8px 12px', color: 'var(--text-soft)', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add Preferred Skill
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, gap: 8 }}>
              <button
                type="button"
                disabled={saving || !canFinishOnboarding(profile)}
                onClick={() => saveProfile(true)}
                style={{ borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, var(--peach), var(--coral))', color: 'white', padding: '10px 14px', fontFamily: 'inherit', fontWeight: 700, cursor: saving || !canFinishOnboarding(profile) ? 'not-allowed' : 'pointer', opacity: saving || !canFinishOnboarding(profile) ? 0.6 : 1 }}
              >
                {saving
                  ? 'Saving...'
                  : profile.onboardingCompleted
                  ? 'Save Profile'
                  : 'Finish Onboarding'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
