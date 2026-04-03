import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import ReviewsPanel from '../components/ReviewsPanel';
import AISkillScanCard from '../components/AISkillScanCard';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { fetchUserReviews } from '../services/reviewService';
import { usePageLoading } from '../contexts/PageLoadingContext';

const PROFICIENCY_LEVELS = [
  { value: 1, label: 'Beginner', description: 'Can follow guides and complete simple tasks with help.' },
  { value: 2, label: 'Elementary', description: 'Can build basic features with occasional guidance.' },
  { value: 3, label: 'Intermediate', description: 'Can work independently on common tasks.' },
  { value: 4, label: 'Advanced', description: 'Can handle complex tasks and debug confidently.' },
  { value: 5, label: 'Expert', description: 'Can architect solutions and mentor others.' },
];

const SKILL_COLORS = [
  { bg: 'rgba(224,93,80,0.1)', text: '#e05d50' },
  { bg: 'rgba(66,165,245,0.1)', text: '#42a5f5' },
  { bg: 'rgba(102,187,106,0.1)', text: '#66bb6a' },
  { bg: 'rgba(179,157,219,0.1)', text: '#b39ddb' },
  { bg: 'rgba(255,202,40,0.12)', text: '#f9a825' },
  { bg: 'rgba(240,98,146,0.1)', text: '#f06292' },
  { bg: 'rgba(255,138,101,0.1)', text: '#ff8a65' },
];

const BAR_GRADIENTS = [
  'linear-gradient(90deg, var(--coral), var(--peach))',
  'linear-gradient(90deg, var(--sky), #64b5f6)',
  'linear-gradient(90deg, var(--mint), #81c784)',
  'linear-gradient(90deg, var(--lavender), #9575cd)',
  'linear-gradient(90deg, var(--honey), #ffd54f)',
  'linear-gradient(90deg, var(--rose), #f48fb1)',
];

const BAR_TEXT_COLORS = [
  'var(--coral)', 'var(--sky)', 'var(--mint)',
  'var(--lavender)', 'var(--honey)', 'var(--rose)',
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
    aiScan: null,
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
    aiScan: data?.aiScan || null,
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

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/* ─────────────────────────────────────────────── */
/*  VIEW MODE — mirrors the prototype design       */
/* ─────────────────────────────────────────────── */

function ProfileView({
  profile,
  onEdit,
  reviewsData,
  reviewsLoading,
  reviewsError,
}) {
  const filledSkills = profile.skills.filter((s) => s.name.trim());
  const filledProjects = profile.projectExperience.filter((p) => p.title.trim());
  const filledWork = profile.workExperience.filter((w) => w.company.trim() || w.role.trim());
  const filledPreferred = profile.preferredSkills.filter((s) => s.name.trim());

  const displayName = profile.personal.displayName || profile.personal.fullName || 'Your Name';
  const university = profile.personal.university || '';
  const major = profile.personal.major || '';
  const year = profile.personal.year || '';
  const uniLine = [university, major, year ? `Year ${year}` : ''].filter(Boolean).join(' \u00B7 ');

  return (
    <div className="profile-layout">
      {/* ── Sidebar ── */}
      <div className="profile-sidebar">
        <div className="profile-cover">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-lg">{getInitials(displayName)}</div>
          </div>
        </div>
        <div className="profile-sidebar-body">
          <h2>{displayName}</h2>
          {uniLine && <p className="profile-uni">{uniLine}</p>}
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          <div className="profile-stats-grid">
            <div className="p-stat">
              <span className="p-val" style={{ color: 'var(--coral)' }}>{filledSkills.length}</span>
              <span className="p-lbl">Skills</span>
            </div>
            <div className="p-stat">
              <span className="p-val" style={{ color: 'var(--sky)' }}>{filledProjects.length}</span>
              <span className="p-lbl">Projects</span>
            </div>
            <div className="p-stat">
              <span className="p-val" style={{ color: 'var(--mint)' }}>{profile.hackathonExperience?.count || 0}</span>
              <span className="p-lbl">Hackathons</span>
            </div>
          </div>

          {(profile.social?.github || profile.social?.linkedin) && (
            <div className="profile-social-row">
              {profile.social.github && (
                <a
                  href={profile.social.github.startsWith('http') ? profile.social.github : `https://github.com/${profile.social.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-social-link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </a>
              )}
              {profile.social.linkedin && (
                <a
                  href={profile.social.linkedin.startsWith('http') ? profile.social.linkedin : `https://linkedin.com/in/${profile.social.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-social-link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              )}
            </div>
          )}

          <button type="button" className="profile-edit-btn" onClick={onEdit}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="profile-main">
        <AISkillScanCard
          profile={profile}
          aiScan={profile.aiScan}
        />

        {/* Skills & Technologies */}
        <div className="profile-section">
          <h3 className="profile-section-title">Skills & Technologies</h3>
          {filledSkills.length > 0 ? (
            <>
              <div className="skills-grid">
                {filledSkills.map((skill, i) => {
                  const c = SKILL_COLORS[i % SKILL_COLORS.length];
                  return (
                    <span key={i} className="skill-tag" style={{ background: c.bg, color: c.text }}>
                      {skill.name}
                    </span>
                  );
                })}
              </div>

              <h3 className="profile-section-title" style={{ marginTop: 6 }}>Skill Proficiency</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {filledSkills.map((skill, i) => {
                  const pct = Math.round((skill.level / 5) * 100);
                  return (
                    <div key={i} className="prof-bar-row">
                      <span className="prof-bar-label">{skill.name}</span>
                      <div className="prof-bar-track">
                        <div
                          className="prof-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: BAR_GRADIENTS[i % BAR_GRADIENTS.length],
                          }}
                        />
                      </div>
                      <span className="prof-bar-val" style={{ color: BAR_TEXT_COLORS[i % BAR_TEXT_COLORS.length] }}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="profile-empty">
              No skills added yet.
              <div className="profile-empty-hint">Edit your profile to add skills.</div>
            </div>
          )}
        </div>

        {/* Preferred Skills */}
        {filledPreferred.length > 0 && (
          <div className="profile-section">
            <h3 className="profile-section-title">Looking For</h3>
            <div className="skills-grid">
              {filledPreferred.map((skill, i) => (
                <span key={i} className="preferred-tag">{skill.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Project Experience */}
        <div className="profile-section">
          <h3 className="profile-section-title">Project Experience</h3>
          {filledProjects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filledProjects.map((proj, i) => (
                <div key={i} className="exp-card">
                  <div className="exp-card-title">{proj.title}</div>
                  {proj.url && (
                    <div className="exp-card-meta">
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                        {proj.url}
                      </a>
                    </div>
                  )}
                  {proj.description && <div className="exp-card-desc">{proj.description}</div>}
                  {proj.technologies && (
                    <div className="exp-card-techs">
                      {proj.technologies.split(',').map((t, j) => (
                        <span key={j} className="exp-card-tech">{t.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-empty">
              No projects added yet.
              <div className="profile-empty-hint">Edit your profile to showcase your work.</div>
            </div>
          )}
        </div>

        {/* Work Experience */}
        {filledWork.length > 0 && (
          <div className="profile-section">
            <h3 className="profile-section-title">Work Experience</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filledWork.map((work, i) => (
                <div key={i} className="exp-card">
                  <div className="exp-card-title">{work.role || work.company}</div>
                  <div className="exp-card-meta">
                    {[work.company, work.duration].filter(Boolean).join(' \u00B7 ')}
                  </div>
                  {work.description && <div className="exp-card-desc">{work.description}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <ReviewsPanel
          title="Reviews You Received"
          reviews={reviewsData.reviews}
          positiveCount={reviewsData.positiveCount}
          negativeCount={reviewsData.negativeCount}
          total={reviewsData.total}
          loading={reviewsLoading}
          error={reviewsError}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  EDIT MODE — retains all existing form logic    */
/* ─────────────────────────────────────────────── */

function ProfileEdit({
  profile,
  updateProfile,
  handleSkillChange,
  addSkill,
  removeSkill,
  addPreferredSkill,
  removePreferredSkill,
  saving,
  errorMessage,
  successMessage,
  saveProfile,
  onBack,
}) {
  return (
    <div className="profile-edit-panel">
      <div className="profile-edit-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 2 }}>
            Edit Profile
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', margin: 0 }}>
            Keep your profile aligned with registration details for better teammate matching.
          </p>
        </div>
        <button type="button" className="profile-edit-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Profile
        </button>
      </div>

      {errorMessage && <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 10, background: 'rgba(224,93,80,0.1)', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 600 }}>{errorMessage}</p>}
      {successMessage && <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 10, background: 'rgba(102,187,106,0.12)', color: 'var(--mint)', fontSize: '0.78rem', fontWeight: 600 }}>{successMessage}</p>}

      {/* About You */}
      <div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>Personal Details</h2>
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
                    personal: { ...prev.personal, [field.key]: nextValue },
                  }));
                }}
                onBlur={(event) => {
                  if (field.key !== 'year' || !event.target.value) return;
                  const parsed = Number.parseInt(event.target.value, 10);
                  const normalized = Number.isFinite(parsed) ? String(Math.min(10, Math.max(1, parsed))) : '1';
                  if (normalized !== profile.personal.year) {
                    updateProfile((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, year: normalized },
                    }));
                  }
                }}
                style={{ borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)' }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>About You</h2>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-soft)' }}>Short Introduction</span>
          <textarea
            value={profile.bio}
            onChange={(e) => updateProfile((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell potential teammates a bit about yourself..."
            rows={3}
            style={{ borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem', resize: 'vertical', color: 'var(--text-dark)' }}
          />
        </label>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Project Experience</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
          {profile.projectExperience.map((proj, index) => (
            <div key={`proj-${index}`} style={{ borderRadius: 12, border: '1px solid var(--border)', padding: 14, background: 'var(--bg)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <input value={proj.title} onChange={(e) => updateProfile((prev) => ({ ...prev, projectExperience: prev.projectExperience.map((p, i) => i === index ? { ...p, title: e.target.value } : p) }))} placeholder="Project title" style={{ borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)' }} />
                <input value={proj.technologies} onChange={(e) => updateProfile((prev) => ({ ...prev, projectExperience: prev.projectExperience.map((p, i) => i === index ? { ...p, technologies: e.target.value } : p) }))} placeholder="Technologies (e.g. React, Node.js)" style={{ borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)' }} />
              </div>
              <input value={proj.url} onChange={(e) => updateProfile((prev) => ({ ...prev, projectExperience: prev.projectExperience.map((p, i) => i === index ? { ...p, url: e.target.value } : p) }))} placeholder="Project URL (optional)" style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-dark)' }} />
              <textarea value={proj.description} onChange={(e) => updateProfile((prev) => ({ ...prev, projectExperience: prev.projectExperience.map((p, i) => i === index ? { ...p, description: e.target.value } : p) }))} placeholder="Brief description of what you built and your role" rows={2} style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', resize: 'vertical', color: 'var(--text-dark)' }} />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <button type="button" onClick={() => updateProfile((prev) => ({ ...prev, projectExperience: prev.projectExperience.length === 1 ? prev.projectExperience : prev.projectExperience.filter((_, i) => i !== index) }))} disabled={profile.projectExperience.length === 1} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', background: 'none', border: 'none', cursor: profile.projectExperience.length === 1 ? 'not-allowed' : 'pointer' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => updateProfile((prev) => ({ ...prev, projectExperience: [...prev.projectExperience, { title: '', description: '', url: '', technologies: '' }] }))} style={{ borderRadius: 10, border: '1px dashed var(--border-strong)', background: 'transparent', padding: '8px 12px', color: 'var(--text-soft)', fontWeight: 600, cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit' }}>
          + Add Project
        </button>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 10 }}>Work Experience</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
          {profile.workExperience.map((work, index) => (
            <div key={`work-${index}`} style={{ borderRadius: 12, border: '1px solid var(--border)', padding: 14, background: 'var(--bg)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <input value={work.company} onChange={(e) => updateProfile((prev) => ({ ...prev, workExperience: prev.workExperience.map((w, i) => i === index ? { ...w, company: e.target.value } : w) }))} placeholder="Company / Organisation" style={{ borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)' }} />
                <input value={work.role} onChange={(e) => updateProfile((prev) => ({ ...prev, workExperience: prev.workExperience.map((w, i) => i === index ? { ...w, role: e.target.value } : w) }))} placeholder="Role / Title" style={{ borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)' }} />
              </div>
              <input value={work.duration} onChange={(e) => updateProfile((prev) => ({ ...prev, workExperience: prev.workExperience.map((w, i) => i === index ? { ...w, duration: e.target.value } : w) }))} placeholder="Duration (e.g. Jun 2025 - Aug 2025)" style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-dark)' }} />
              <textarea value={work.description} onChange={(e) => updateProfile((prev) => ({ ...prev, workExperience: prev.workExperience.map((w, i) => i === index ? { ...w, description: e.target.value } : w) }))} placeholder="Brief description of your responsibilities" rows={2} style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg-card)', fontFamily: 'inherit', fontSize: '0.8rem', resize: 'vertical', color: 'var(--text-dark)' }} />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <button type="button" onClick={() => updateProfile((prev) => ({ ...prev, workExperience: prev.workExperience.length === 1 ? prev.workExperience : prev.workExperience.filter((_, i) => i !== index) }))} disabled={profile.workExperience.length === 1} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-soft)', background: 'none', border: 'none', cursor: profile.workExperience.length === 1 ? 'not-allowed' : 'pointer' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => updateProfile((prev) => ({ ...prev, workExperience: [...prev.workExperience, { company: '', role: '', duration: '', description: '' }] }))} style={{ borderRadius: 10, border: '1px dashed var(--border-strong)', background: 'transparent', padding: '8px 12px', color: 'var(--text-soft)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Add Work Experience
        </button>
      </div>

      {/* Skills */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>Your Skills</h2>
        <p style={{ marginTop: 0, fontSize: '0.78rem', color: 'var(--text-soft)', marginBottom: 14 }}>
          Add your skills and rate your proficiency from 1 to 5.
        </p>

        <div style={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg)', padding: 12, marginBottom: 12 }}>
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
                style={{ borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)' }}
              />
              <select
                value={skill.level}
                onChange={(event) => handleSkillChange(index, 'level', event.target.value)}
                style={{ borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)' }}
              >
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>{`${level.value} - ${level.label}`}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                disabled={profile.skills.length === 1}
                style={{ borderRadius: 10, border: '1px solid var(--border-strong)', background: 'var(--bg-card)', fontFamily: 'inherit', fontWeight: 700, color: 'var(--text-soft)', cursor: profile.skills.length === 1 ? 'not-allowed' : 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addSkill} style={{ borderRadius: 10, border: '1px dashed var(--border-strong)', background: 'transparent', padding: '8px 12px', color: 'var(--text-soft)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Add Skill
        </button>
      </div>

      {/* Preferred Skills */}
      <div style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>Your Preferred Skills</h2>
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
                      skillIndex === index ? { ...entry, name: event.target.value } : entry
                    ),
                  }))
                }
                placeholder="Preferred skill"
                style={{ borderRadius: 10, border: '1px solid var(--border-strong)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)' }}
              />
              <button
                type="button"
                onClick={() => removePreferredSkill(index)}
                disabled={profile.preferredSkills.length === 1}
                style={{ borderRadius: 10, border: '1px solid var(--border-strong)', background: 'var(--bg-card)', fontFamily: 'inherit', fontWeight: 700, color: 'var(--text-soft)', cursor: profile.preferredSkills.length === 1 ? 'not-allowed' : 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addPreferredSkill} style={{ borderRadius: 10, border: '1px dashed var(--border-strong)', background: 'transparent', padding: '8px 12px', color: 'var(--text-soft)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Add Preferred Skill
        </button>
      </div>

      {/* Save buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 8 }}>
        <button
          type="button"
          onClick={onBack}
          style={{ borderRadius: 12, border: '1.5px solid var(--border-strong)', background: 'var(--bg-card)', color: 'var(--text-dark)', padding: '10px 18px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving || !canFinishOnboarding(profile)}
          onClick={() => saveProfile(true)}
          style={{
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, var(--peach), var(--coral))',
            color: 'white',
            padding: '10px 18px',
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: saving || !canFinishOnboarding(profile) ? 'not-allowed' : 'pointer',
            opacity: saving || !canFinishOnboarding(profile) ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : profile.onboardingCompleted ? 'Save Profile' : 'Finish Onboarding'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/*  MAIN PROFILE PAGE                              */
/* ─────────────────────────────────────────────── */

export default function Profile() {
  const { user, refreshOnboardingStatus } = useAuth();
  const { setPageLoading } = usePageLoading();
  const [profile, setProfile] = useState(() => createDefaultProfile(user));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [reviewsData, setReviewsData] = useState({ reviews: [], positiveCount: 0, negativeCount: 0, total: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  const loadReviews = useCallback(async (userId) => {
    if (!userId) {
      return;
    }

    setReviewsLoading(true);
    setReviewsError('');

    try {
      const data = await fetchUserReviews(userId);
      setReviewsData(data);
    } catch (error) {
      setReviewsError(error?.response?.data?.error?.message || 'Could not load reviews.');
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setPageLoading(true);
      setErrorMessage('');

      try {
        const response = await api.get('/api/v1/profile/me');
        if (!active) return;
        const loaded = normalizeIncomingProfile(response?.data?.profile, user);
        setProfile(loaded);
        loadReviews(response?.data?.profile?.id);
        // If onboarding not done, go straight to edit mode
        if (!loaded.onboardingCompleted) setEditing(true);
      } catch (error) {
        if (!active) return;
        setProfile(createDefaultProfile(user));
        setEditing(true);
        setErrorMessage(
          error?.response?.data?.error?.message || 'Could not load profile, but you can continue editing.'
        );
      } finally {
        if (active) {
          setLoading(false);
          setPageLoading(false);
        }
      }
    }

    loadProfile();
    return () => { active = false; };
  }, [loadReviews, user]);

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
          ? { ...skill, [key]: key === 'level' ? Number(value) : value }
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
      skills: prev.skills.length === 1 ? prev.skills : prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addPreferredSkill = () => {
    updateProfile((prev) => ({ ...prev, preferredSkills: [...prev.preferredSkills, { name: '' }] }));
  };

  const removePreferredSkill = (index) => {
    updateProfile((prev) => ({
      ...prev,
      preferredSkills: prev.preferredSkills.length === 1 ? prev.preferredSkills : prev.preferredSkills.filter((_, i) => i !== index),
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
      const saved = normalizeIncomingProfile(response?.data?.profile, user);
      setProfile(saved);
      loadReviews(response?.data?.profile?.id);
      await refreshOnboardingStatus();
      setSuccessMessage(markOnboardingComplete ? 'Profile updated.' : 'Draft saved.');
      // After successful save, switch back to view mode
      if (saved.onboardingCompleted) setEditing(false);
    } catch (error) {
      setErrorMessage(error?.response?.data?.error?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh' }} />;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="mesh-bg"><div className="mesh-blob blob-1" /><div className="mesh-blob blob-2" /><div className="mesh-blob blob-3" /></div>
      <div className="noise" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 2, padding: '28px 40px 60px', maxWidth: 1120, margin: '0 auto' }}
      >
        {!editing && errorMessage && (
          <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 10, background: 'rgba(224,93,80,0.1)', color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 600 }}>
            {errorMessage}
          </p>
        )}
        {!editing && successMessage && (
          <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 10, background: 'rgba(102,187,106,0.12)', color: 'var(--mint)', fontSize: '0.78rem', fontWeight: 600 }}>
            {successMessage}
          </p>
        )}

        {editing ? (
          <ProfileEdit
            profile={profile}
            updateProfile={updateProfile}
            handleSkillChange={handleSkillChange}
            addSkill={addSkill}
            removeSkill={removeSkill}
            addPreferredSkill={addPreferredSkill}
            removePreferredSkill={removePreferredSkill}
            saving={saving}
            errorMessage={errorMessage}
            successMessage={successMessage}
            saveProfile={saveProfile}
            onBack={() => {
              setEditing(false);
              setErrorMessage('');
              setSuccessMessage('');
            }}
          />
        ) : (
          <ProfileView
            profile={profile}
            onEdit={() => setEditing(true)}
            reviewsData={reviewsData}
            reviewsLoading={reviewsLoading}
            reviewsError={reviewsError}
          />
        )}
      </motion.div>
    </div>
  );
}
