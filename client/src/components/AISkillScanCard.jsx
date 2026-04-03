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
  canRescan = false,
  rescanning = false,
  onRescan,
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
            AI-style estimate based on your profile signals, projects, work history, and links. No external model calls in this MVP.
          </p>
        </div>

        {canRescan && (
          <button
            type="button"
            className="ai-scan-button"
            onClick={onRescan}
            disabled={rescanning}
          >
            {rescanning ? 'Scanning...' : aiScan ? 'Rescan' : 'Run Scan'}
          </button>
        )}
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
                      <span>Claimed {skill.claimedLevel}/5</span>
                      <span className="ai-scan-dot" />
                      <span>Estimated {skill.estimatedLevel}/5</span>
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
                  Reads closest to <strong>{levelLabel(skill.estimatedLevel)}</strong>
                </div>

                <div className="ai-scan-evidence">
                  {skill.evidence.map((item) => (
                    <span key={item} className="ai-scan-evidence-chip">{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="ai-scan-empty">
          <div className="ai-scan-empty-copy">
            <strong>No scan yet.</strong>
            <p>
              {skillCount === 0
                ? 'Add a few skills first so the scan has something to estimate.'
                : hasSupportingSignal(profile)
                  ? 'Your profile is ready. Run the scan to generate estimated skill levels.'
                  : 'Add project details, work experience, or links so the scan has enough signal to work with.'}
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
