import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import ReviewsPanel from '../components/ReviewsPanel';
import { useChatContext } from '../contexts/ChatContext';
import api from '../services/api';
import { createReview, fetchReviewEligibility, fetchUserReviews } from '../services/reviewService';

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

function tierStyle(tier) {
  if (tier === 'Advanced') return { color: 'var(--accent)', bg: 'rgba(224,93,80,0.1)' };
  if (tier === 'Intermediate') return { color: 'var(--sky)', bg: 'rgba(66,165,245,0.1)' };
  return { color: 'var(--text-soft)', bg: 'rgba(128,128,128,0.08)' };
}

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openOrCreateDM } = useChatContext();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Relationship state
  const [canMessage, setCanMessage] = useState(false);

  // Team invite state
  const [teams, setTeams] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [inviteStatus, setInviteStatus] = useState('idle'); // idle | sending | sent | error
  const [inviteError, setInviteError] = useState('');
  const [reviewsData, setReviewsData] = useState({ reviews: [], positiveCount: 0, negativeCount: 0, total: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFormError, setReviewFormError] = useState('');
  const [reviewFormSuccess, setReviewFormSuccess] = useState('');

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError('');
    try {
      const data = await fetchUserReviews(id);
      setReviewsData(data);
    } catch (err) {
      setReviewsError(err.response?.data?.error?.message || 'Could not load reviews.');
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  const loadReviewEligibility = useCallback(async () => {
    try {
      const data = await fetchReviewEligibility(id);
      setReviewEligibility(data);
    } catch (err) {
      setReviewEligibility({
        canReview: false,
        reason: err.response?.data?.error?.message || 'Could not load review eligibility.',
        sharedTeams: [],
        existingReviews: [],
      });
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setCanMessage(false);

    api.get(`/api/v1/profile/${id}`)
      .then(({ data }) => {
        if (active) setProfile(data.profile);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || 'Could not load profile.');
      })
      .finally(() => { if (active) setLoading(false); });

    api.get(`/api/v1/discover/relationship/${id}`)
      .then(({ data }) => {
        if (active) setCanMessage(data.matched || data.onSameTeam);
      })
      .catch(() => {});

    loadReviews();
    loadReviewEligibility();

    return () => { active = false; };
  }, [id, loadReviewEligibility, loadReviews]);

  // Fetch teams when invite section opens
  useEffect(() => {
    if (!inviteOpen) return;
    api.get('/api/v1/teams')
      .then(({ data }) => {
        setTeams(data.teams || []);
        if (data.teams?.length) setSelectedTeam(data.teams[0].id);
      })
      .catch(() => {});
  }, [inviteOpen]);

  const handleInvite = useCallback(async () => {
    if (!selectedTeam || !profile?.email) return;
    setInviteStatus('sending');
    setInviteError('');
    try {
      await api.post(`/api/v1/teams/${selectedTeam}/invite`, { email: profile.email });
      setInviteStatus('sent');
    } catch (err) {
      setInviteError(err.response?.data?.error?.message || 'Failed to send invite.');
      setInviteStatus('error');
    }
  }, [selectedTeam, profile?.email]);

  const handleMessage = async () => {
    if (!profile) return;
    await openOrCreateDM(profile.firebaseUid);
    navigate('/messages');
  };

  const handleReviewSubmit = useCallback(async (payload) => {
    setReviewSubmitting(true);
    setReviewFormError('');
    setReviewFormSuccess('');

    try {
      await createReview({
        targetUserId: id,
        ...payload,
      });
      setReviewFormSuccess('Review submitted.');
      await Promise.all([loadReviews(), loadReviewEligibility()]);
    } catch (err) {
      setReviewFormError(err.response?.data?.error?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  }, [id, loadReviewEligibility, loadReviews]);

  if (loading) {
    return (
      <>

        <div style={{ paddingTop: 72, minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', margin: '0 auto 12px',
              border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
              animation: 'spin 0.9s linear infinite',
            }} />
            <p style={{ color: 'var(--text-soft)', fontWeight: 600, fontSize: '0.84rem' }}>Loading profile...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>

        <div style={{ paddingTop: 72, minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 360, padding: 24 }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>:/</div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>Profile not found</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: '0.84rem', marginBottom: 20, lineHeight: 1.6 }}>
              {error || 'This user may not exist or their profile is private.'}
            </p>
            <button
              onClick={() => navigate('/discover')}
              style={{
                padding: '10px 22px', borderRadius: 12, border: 'none',
                background: 'var(--accent)', color: 'white', cursor: 'pointer',
                fontFamily: 'inherit', fontWeight: 700, fontSize: '0.84rem',
              }}
            >
              Back to Discover
            </button>
          </div>
        </div>
      </>
    );
  }

  const displayName = profile.personal?.name || 'Unknown';
  const university = profile.personal?.university || '';
  const major = profile.personal?.major || '';
  const year = profile.personal?.year || '';
  const uniLine = [university, major, year ? `Year ${year}` : ''].filter(Boolean).join(' \u00B7 ');
  const filledSkills = (profile.skills || []).filter((s) => s.name?.trim());
  const filledProjects = (profile.projectExperience || []).filter((p) => p.title?.trim());
  const filledWork = (profile.workExperience || []).filter((w) => w.company?.trim() || w.role?.trim());
  const filledPreferred = (profile.interests || []).filter(Boolean);
  const tc = tierStyle(profile.skillTier);

  return (
    <>
      <div style={{
        paddingTop: 88, paddingBottom: 48,
        maxWidth: 1040, margin: '0 auto',
        padding: '88px clamp(16px, 3vw, 40px) 48px',
      }}>
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 20, fontSize: '0.78rem', fontWeight: 600,
          }}
        >
          <button
            onClick={() => navigate('/discover')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontFamily: 'inherit', fontWeight: 600,
              fontSize: '0.78rem', padding: 0,
            }}
          >
            Discover
          </button>
          <span style={{ color: 'var(--text-faint)' }}>/</span>
          <span style={{ color: 'var(--text-soft)' }}>{displayName}</span>
        </motion.div>

        <div className="profile-layout">
          {/* Sidebar */}
          <motion.div
            className="profile-sidebar"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="profile-cover">
              <div className="profile-avatar-wrap">
                {profile.photoDataUrl ? (
                  <img
                    src={profile.photoDataUrl}
                    alt={displayName}
                    style={{
                      width: 64, height: 64, borderRadius: 18, objectFit: 'cover',
                      border: '3px solid var(--bg-card)', boxShadow: 'var(--shadow-soft)',
                    }}
                  />
                ) : (
                  <div className="profile-avatar-lg">{getInitials(displayName)}</div>
                )}
              </div>
            </div>

            <div className="profile-sidebar-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0 }}>{displayName}</h2>
                {profile.skillTier && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 8, fontSize: '0.62rem',
                    fontWeight: 700, background: tc.bg, color: tc.color,
                  }}>
                    {profile.skillTier}
                  </span>
                )}
              </div>

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

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {canMessage && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleMessage}
                    style={{
                      width: '100%', padding: '11px 16px', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, var(--accent), var(--peach))',
                      color: 'white', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.82rem', fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(224,93,80,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Message
                  </motion.button>
                )}

                <button
                  onClick={() => { setInviteOpen((o) => !o); setInviteStatus('idle'); setInviteError(''); }}
                  style={{
                    width: '100%', padding: '11px 16px', borderRadius: 12,
                    border: '1.5px solid var(--border-strong)',
                    background: 'transparent', color: 'var(--text-body)', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-body)'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Invite to Team
                </button>
              </div>

              {/* Inline invite section */}
              <AnimatePresence>
                {inviteOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      marginTop: 10, padding: '14px', borderRadius: 14,
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      textAlign: 'left',
                    }}>
                      {inviteStatus === 'sent' ? (
                        <div style={{
                          textAlign: 'center', padding: '6px 0',
                          fontSize: '0.8rem', fontWeight: 700, color: 'var(--mint)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Invite sent
                        </div>
                      ) : teams.length === 0 ? (
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-soft)', margin: 0, textAlign: 'center' }}>
                          You aren't on any teams yet.
                        </p>
                      ) : (
                        <>
                          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Select team
                          </label>
                          <select
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                            style={{
                              width: '100%', marginTop: 6, padding: '9px 10px', borderRadius: 10,
                              border: '1px solid var(--border-strong)', background: 'var(--bg-card)',
                              fontFamily: 'inherit', fontSize: '0.8rem', color: 'var(--text-dark)',
                            }}
                          >
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          {inviteError && (
                            <p style={{
                              fontSize: '0.74rem', color: 'var(--accent)', marginTop: 8, marginBottom: 0,
                              padding: '7px 10px', borderRadius: 8, background: 'rgba(224,93,80,0.08)',
                            }}>
                              {inviteError}
                            </p>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleInvite}
                            disabled={inviteStatus === 'sending'}
                            style={{
                              width: '100%', marginTop: 10, padding: '10px', borderRadius: 10,
                              border: 'none', background: 'var(--accent)', color: 'white',
                              cursor: inviteStatus === 'sending' ? 'wait' : 'pointer',
                              fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700,
                              opacity: inviteStatus === 'sending' ? 0.6 : 1,
                            }}
                          >
                            {inviteStatus === 'sending' ? 'Sending...' : 'Send Invite'}
                          </motion.button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Main content */}
          <motion.div
            className="profile-main"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
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
                  No skills listed yet.
                </div>
              )}
            </div>

            {/* Looking For */}
            {filledPreferred.length > 0 && (
              <div className="profile-section">
                <h3 className="profile-section-title">Looking For</h3>
                <div className="skills-grid">
                  {filledPreferred.map((name, i) => (
                    <span key={i} className="preferred-tag">{name}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Experience */}
            {filledProjects.length > 0 && (
              <div className="profile-section">
                <h3 className="profile-section-title">Project Experience</h3>
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
              </div>
            )}

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

            {/* Portfolio Links */}
            {profile.privacy?.showPortfolio && profile.portfolioLinks?.filter((l) => l.url).length > 0 && (
              <div className="profile-section">
                <h3 className="profile-section-title">Portfolio</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.portfolioLinks.filter((l) => l.url).map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-social-link"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      {link.label || 'Link'}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <ReviewsPanel
              reviews={reviewsData.reviews}
              positiveCount={reviewsData.positiveCount}
              negativeCount={reviewsData.negativeCount}
              total={reviewsData.total}
              loading={reviewsLoading}
              error={reviewsError}
              compose={{
                enabled: Boolean(reviewEligibility?.canReview),
                eligibility: reviewEligibility,
                loading: !reviewEligibility,
                submitting: reviewSubmitting,
                error: reviewFormError,
                success: reviewFormSuccess,
                onSubmit: handleReviewSubmit,
              }}
            />
          </motion.div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
