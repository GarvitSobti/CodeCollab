import React from 'react';

function hasSupportingSignal(profile) {
  return Boolean(
    profile?.bio ||
    profile?.projectExperience?.some((project) => project?.title?.trim()) ||
    profile?.workExperience?.some((item) => item?.company?.trim() || item?.role?.trim()) ||
    profile?.portfolioLinks?.some((link) => link?.url?.trim()) ||
    profile?.social?.github ||
    profile?.social?.linkedin ||
    (profile?.hackathonExperience?.count || 0) > 0 ||
    profile?.hackathonExperience?.summary
  );
}

function levelLabel(level) {
  return ['Unrated', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'][level] || 'Estimated';
}

function deltaLabel(claimedLevel, estimatedLevel) {
  if (estimatedLevel < claimedLevel) {
    return `Actually reads ${claimedLevel - estimatedLevel} level${claimedLevel - estimatedLevel > 1 ? 's' : ''} lower`;
  }

  if (estimatedLevel > claimedLevel) {
    return `Actually reads ${estimatedLevel - claimedLevel} level${estimatedLevel - claimedLevel > 1 ? 's' : ''} higher`;
  }

  return 'Estimate matches the claimed level';
}

function formatScanDate(value) {
  if (!value) return 'Not scanned yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scanned yet';

  return new Intl.DateTimeFormat('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function AISkillScanCard({
  profile,
  aiScan,
  title = 'AI Skill Scan',
}) {
  const skillCount = (profile?.skills || []).filter((skill) => skill.name?.trim()).length;
  const scanSkills = aiScan?.skills || [];
  const averageConfidence = scanSkills.length
    ? Math.round(scanSkills.reduce((sum, skill) => sum + skill.confidence, 0) / scanSkills.length)
    : 0;

  return (
    <section className="profile-section ai-scan-card">
      <div className="ai-scan-head">
        <div>
          <div className="ai-scan-eyebrow">Profile Intelligence</div>
          <h3 className="profile-section-title ai-scan-title">{title}</h3>
          <p className="ai-scan-subtitle">
            Default teammate-check signal. The app compares what the user claimed against an estimated actual level in the background.
          </p>
        </div>
      </div>

      {aiScan ? (
        <>
          <div className="ai-scan-metrics">
            <div className="ai-scan-metric">
              <span className="ai-scan-metric-label">Overall Score</span>
              <strong>{aiScan.overallScore}</strong>
            </div>
            <div className="ai-scan-metric">
              <span className="ai-scan-metric-label">Scanned Skills</span>
              <strong>{scanSkills.length}</strong>
            </div>
            <div className="ai-scan-metric">
              <span className="ai-scan-metric-label">Avg Confidence</span>
              <strong>{averageConfidence}%</strong>
            </div>
            <div className="ai-scan-metric">
              <span className="ai-scan-metric-label">Last Scan</span>
              <strong>{formatScanDate(aiScan.lastScannedAt)}</strong>
            </div>
          </div>

          <p className="ai-scan-summary">{aiScan.summary}</p>

          <div className="ai-scan-grid">
            {scanSkills.map((skill) => (
              <article key={skill.name} className="ai-scan-skill-card">
                <div className="ai-scan-skill-top">
                  <div>
                    <div className="ai-scan-skill-name">{skill.name}</div>
                    <div className="ai-scan-skill-levels">
                      <span>User indicated {skill.claimedLevel}/5</span>
                      <span className="ai-scan-dot" />
                      <span>Estimated actual {skill.estimatedLevel}/5</span>
                    </div>
                  </div>
                  <span className="ai-scan-confidence">{skill.confidence}% confidence</span>
                </div>

                <div className="ai-scan-level-track">
                  <div
                    className="ai-scan-level-fill"
                    style={{ width: `${(skill.estimatedLevel / 5) * 100}%` }}
                  />
                </div>

                <div className="ai-scan-level-caption">
                  <strong>{levelLabel(skill.estimatedLevel)}</strong> . {deltaLabel(skill.claimedLevel, skill.estimatedLevel)}
                </div>

                {skill.evidence.length > 0 && (
                  <div className="ai-scan-evidence">
                    {skill.evidence.map((item) => (
                      <span key={item} className="ai-scan-evidence-chip">{item}</span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="ai-scan-empty">
          <div className="ai-scan-empty-copy">
            <strong>No estimate yet.</strong>
            <p>
              {skillCount === 0
                ? 'Add at least one skill and the app will automatically generate a claimed-vs-estimated comparison.'
                : hasSupportingSignal(profile)
                  ? 'Your numbers should already be here. Save the profile once if you just added new skills.'
                  : 'Add a skill first and the automatic scan will fill in the rest.'}
            </p>
          </div>

          <div className="ai-scan-empty-hints">
            <span>Skills: {skillCount}</span>
            <span>Projects</span>
            <span>Work</span>
            <span>Links</span>
          </div>
        </div>
      )}
    </section>
  );
}
