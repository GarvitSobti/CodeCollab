import React, { useEffect, useMemo, useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const SECTIONS = ['Basics', 'Hackathon MCQ', 'Case + Sliders', 'Skills + GitHub', 'Privacy'];

const MCQ_QUESTIONS = [
  {
    key: 'rolePreference',
    title: 'What role do you naturally take in a hackathon team?',
    options: [
      { value: 'frontend', label: 'Frontend builder' },
      { value: 'backend', label: 'Backend/API builder' },
      { value: 'fullstack', label: 'Full-stack problem solver' },
      { value: 'ai', label: 'AI/ML contributor' },
      { value: 'product', label: 'Product/pitch coordinator' },
    ],
  },
  {
    key: 'strongestArea',
    title: 'Which area feels strongest today?',
    options: [
      { value: 'ui', label: 'UI/UX implementation' },
      { value: 'api', label: 'API architecture' },
      { value: 'data', label: 'Data modeling/queries' },
      { value: 'ml', label: 'ML experimentation' },
      { value: 'devops', label: 'Deployment/infrastructure' },
      { value: 'unknown', label: 'Still exploring' },
    ],
  },
  {
    key: 'comfortAmbiguity',
    title: 'How do you handle unclear problem statements?',
    options: [
      { value: 'low', label: 'Need very clear steps first' },
      { value: 'medium', label: 'Can work with some uncertainty' },
      { value: 'high', label: 'Comfortable shaping ambiguity into scope' },
    ],
  },
  {
    key: 'debuggingApproach',
    title: 'Your default debugging style is:',
    options: [
      { value: 'guess', label: 'Try random fixes quickly' },
      { value: 'logs', label: 'Read logs and inspect inputs' },
      { value: 'isolate', label: 'Reproduce and isolate minimal failure' },
      { value: 'hypothesis', label: 'Hypothesis-driven + measure results' },
    ],
  },
  {
    key: 'teamworkStyle',
    title: 'Your collaboration style in intense sprints:',
    options: [
      { value: 'follow', label: 'Take assigned tickets and execute' },
      { value: 'contributor', label: 'Contribute ideas + code actively' },
      { value: 'coordinator', label: 'Coordinate priorities and unblock others' },
      { value: 'lead', label: 'Drive architecture and delivery decisions' },
    ],
  },
];

const CASE_QUESTIONS = [
  {
    key: 'mvpTradeoff',
    title: 'Case: 8 hours left, core feature unstable, demo deadline fixed. What do you do?',
    options: [
      { value: 'build_fast_ignore_risk', label: 'Ship quickly, accept unknown risks' },
      { value: 'define_scope_and_milestones', label: 'Cut scope, stabilize MVP, set mini milestones' },
      { value: 'overengineer', label: 'Re-architect major parts for long-term quality' },
      { value: 'wait_for_perfect_plan', label: 'Pause coding until full plan is documented' },
    ],
  },
  {
    key: 'prodIncident',
    title: 'Case: Live demo just broke due to API errors. First move?',
    options: [
      { value: 'rollback_and_triage', label: 'Rollback/fallback immediately, then triage root cause' },
      { value: 'patch_without_rootcause', label: 'Hotfix quickly without deep investigation' },
      { value: 'wait_for_someone_else', label: 'Wait for teammate expert to handle it' },
      { value: 'random_trial_error', label: 'Try random code changes until it works' },
    ],
  },
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
      name: authUser?.displayName || authUser?.email || '',
      university: '',
      year: '',
      major: '',
    },
    skills: [{ name: '', level: 1 }],
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
    skills: Array.isArray(data?.skills) && data.skills.length ? data.skills : base.skills,
    portfolioLinks:
      Array.isArray(data?.portfolioLinks) && data.portfolioLinks.length
        ? data.portfolioLinks
        : base.portfolioLinks,
  };
}

function computeLocalCompletion(profile) {
  const checks = [
    Boolean(profile.personal.name),
    Boolean(profile.personal.university),
    Boolean(profile.personal.year),
    Boolean(profile.personal.major),
    profile.skills.some((skill) => skill.name),
    Boolean(profile.assessment.mcq.rolePreference),
    Boolean(profile.assessment.mcq.strongestArea),
    Boolean(profile.assessment.mcq.comfortAmbiguity),
    Boolean(profile.assessment.mcq.debuggingApproach),
    Boolean(profile.assessment.mcq.teamworkStyle),
    Boolean(profile.assessment.caseBased.mvpTradeoff),
    Boolean(profile.assessment.caseBased.prodIncident),
    Boolean(profile.social.github),
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function completionHint(completion) {
  if (completion < 40) return 'Complete the assessment to unlock meaningful teammate recommendations.';
  if (completion < 70) return 'Almost there. A few more answers make matching much stronger.';
  if (completion < 90) return 'Good profile signal. Match quality is now high.';
  return 'Great. Your profile is ready for skill-calibrated matching.';
}

function canFinishOnboarding(profile) {
  const hasBasics = Boolean(
    profile.personal.name && profile.personal.university && profile.personal.year && profile.personal.major
  );
  const hasMcq = MCQ_QUESTIONS.every((question) => Boolean(profile.assessment.mcq[question.key]));
  const hasCase = CASE_QUESTIONS.every((question) => Boolean(profile.assessment.caseBased[question.key]));
  const hasSkill = profile.skills.some((skill) => skill.name);
  return hasBasics && hasMcq && hasCase && hasSkill;
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
          error?.response?.data?.error?.message || 'Could not load profile, but you can continue onboarding.'
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

  const completion = useMemo(() => {
    if (profile?.completion) return profile.completion;
    return computeLocalCompletion(profile);
  }, [profile]);

  const updateProfile = (updater) => {
    setProfile((previous) => {
      const next = typeof updater === 'function' ? updater(previous) : updater;
      return {
        ...next,
        completion: computeLocalCompletion(next),
      };
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

  const saveProfile = async (markOnboardingComplete) => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        ...profile,
        onboardingCompleted: markOnboardingComplete ? true : profile.onboardingCompleted,
      };
      const response = await api.put('/api/v1/profile/me', payload);
      setProfile(normalizeIncomingProfile(response?.data?.profile, user));
      await refreshOnboardingStatus();
      setSuccessMessage(markOnboardingComplete ? 'Onboarding completed.' : 'Draft saved.');
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
          <p style={{ color: 'var(--text-soft)', fontWeight: 700 }}>Loading onboarding...</p>
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
            {profile.onboardingCompleted ? 'Profile Calibration' : 'Skill Calibration Onboarding'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', marginBottom: 10 }}>
            Answer hackathon-focused questions so teammate recommendations are based on real execution fit.
          </p>

          <div style={{ borderRadius: 14, padding: 12, background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-soft)' }}>Calibration completion</span>
              <span style={{ fontSize: '0.74rem', fontWeight: 700 }}>{completion}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 8, background: 'var(--bg)', overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${completion}%`, borderRadius: 8, background: 'linear-gradient(90deg, var(--peach), var(--coral))' }} />
            </div>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-soft)' }}>{completionHint(completion)}</p>
          </div>
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
                Internal level scoring is hidden from users and later enriched with GitHub signals (projects/commits/PR quality).
              </p>
            </div>
          </div>

          <div style={{ borderRadius: 'var(--radius)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.04)', padding: 22 }}>
            {errorMessage && <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,138,101,0.12)', color: 'var(--coral)', fontSize: '0.78rem', fontWeight: 600 }}>{errorMessage}</p>}
            {successMessage && <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 10, background: 'rgba(102,187,106,0.12)', color: 'var(--mint)', fontSize: '0.78rem', fontWeight: 600 }}>{successMessage}</p>}

              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Basic Academic Context</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[{ key: 'name', label: 'Full Name' }, { key: 'university', label: 'University' }, { key: 'year', label: 'Current Year' }, { key: 'major', label: 'Major' }].map((field) => (
                    <label key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-soft)' }}>{field.label}</span>
                      <input
                        value={profile.personal[field.key]}
                        onChange={(event) => updateProfile((prev) => ({ ...prev, personal: { ...prev.personal, [field.key]: event.target.value } }))}
                        style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                      />
                    </label>
                  ))}
                </div>
              </div>

            <div style={{ marginTop: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Hackathon-Oriented MCQ</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {MCQ_QUESTIONS.map((question) => (
                    <div key={question.key} style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', background: 'var(--bg)' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 700 }}>{question.title}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {question.options.map((option) => (
                          <label key={option.value} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.78rem' }}>
                            <input
                              type="radio"
                              name={question.key}
                              checked={profile.assessment.mcq[question.key] === option.value}
                              onChange={() =>
                                updateProfile((prev) => ({
                                  ...prev,
                                  assessment: {
                                    ...prev.assessment,
                                    mcq: {
                                      ...prev.assessment.mcq,
                                      [question.key]: option.value,
                                    },
                                  },
                                }))
                              }
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Case Responses + Self-Rated Execution</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
                  {CASE_QUESTIONS.map((question) => (
                    <div key={question.key} style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', background: 'var(--bg)' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '0.8rem', fontWeight: 700 }}>{question.title}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {question.options.map((option) => (
                          <label key={option.value} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.78rem' }}>
                            <input
                              type="radio"
                              name={question.key}
                              checked={profile.assessment.caseBased[question.key] === option.value}
                              onChange={() =>
                                updateProfile((prev) => ({
                                  ...prev,
                                  assessment: {
                                    ...prev.assessment,
                                    caseBased: {
                                      ...prev.assessment.caseBased,
                                      [question.key]: option.value,
                                    },
                                  },
                                }))
                              }
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { key: 'buildSpeed', label: 'How quickly can you ship MVP features?' },
                    { key: 'systemDesign', label: 'System design confidence under time pressure' },
                    { key: 'debugging', label: 'Debugging confidence in unfamiliar stacks' },
                    { key: 'collaboration', label: 'Collaboration/communication under stress' },
                    { key: 'learningVelocity', label: 'Ability to learn new APIs/tools fast' },
                  ].map((item) => (
                    <label key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', background: 'var(--bg)' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-body)' }}>{item.label}</span>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={profile.assessment.sliders[item.key]}
                        onChange={(event) =>
                          updateProfile((prev) => ({
                            ...prev,
                            assessment: {
                              ...prev.assessment,
                              sliders: {
                                ...prev.assessment.sliders,
                                [item.key]: Number(event.target.value),
                              },
                            },
                          }))
                        }
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>Level {profile.assessment.sliders[item.key]} / 5</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Skills + GitHub Readiness</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                  {profile.skills.map((skill, index) => (
                    <div key={`skill-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px', gap: 8 }}>
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
                        {[1, 2, 3, 4, 5].map((level) => (
                          <option key={level} value={level}>{`Level ${level}`}</option>
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

                <button type="button" onClick={addSkill} style={{ borderRadius: 10, border: '1px dashed rgba(0,0,0,0.15)', background: 'transparent', padding: '8px 12px', color: 'var(--text-soft)', fontWeight: 600, cursor: 'pointer', marginBottom: 14 }}>
                  + Add Skill
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-soft)' }}>Hackathons joined (count)</span>
                    <input
                      type="number"
                      min={0}
                      value={profile.hackathonExperience.count}
                      onChange={(event) => updateProfile((prev) => ({ ...prev, hackathonExperience: { ...prev.hackathonExperience, count: Number(event.target.value) } }))}
                      style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-soft)' }}>GitHub profile URL (recommended)</span>
                    <input
                      value={profile.social.github}
                      onChange={(event) => updateProfile((prev) => ({ ...prev, social: { ...prev.social, github: event.target.value } }))}
                      placeholder="https://github.com/username"
                      style={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px', background: 'var(--bg)', fontFamily: 'inherit', fontSize: '0.8rem' }}
                    />
                  </label>
                </div>

                <p style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: 10 }}>
                  Next phase will use GitHub API signals (project quality, commit activity, PR behavior) to strengthen internal calibration.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Privacy + Finalize</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  {[
                    { key: 'showEmail', label: 'Show email on profile' },
                    { key: 'showPortfolio', label: 'Show project links publicly' },
                    { key: 'discoverable', label: 'Allow recommendation matching' },
                  ].map((item) => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'var(--bg)', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(profile.privacy[item.key])}
                        onChange={(event) =>
                          updateProfile((prev) => ({
                            ...prev,
                            privacy: {
                              ...prev.privacy,
                              [item.key]: event.target.checked,
                            },
                          }))
                        }
                      />
                      <span style={{ fontSize: '0.78rem' }}>{item.label}</span>
                    </label>
                  ))}
                </div>

                <div style={{ borderRadius: 12, background: 'var(--bg)', padding: 14 }}>
                  <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-soft)' }}>Summary</p>
                  <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
                    {profile.personal.name || 'Unnamed'} · {profile.personal.university || 'University not set'} · {profile.skills.filter((skill) => skill.name).length} skills
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: '0.76rem', color: 'var(--text-soft)' }}>
                    GitHub connected: {profile.social.github ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, gap: 8 }}>
              <button
                type="button"
                onClick={() => saveProfile(false)}
                disabled={saving}
                style={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg)', padding: '10px 14px', fontFamily: 'inherit', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', color: 'var(--text-body)' }}
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>

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
