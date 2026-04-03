const crypto = require('crypto');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function stableHash(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

function createSeed() {
  return crypto.randomBytes(8).toString('hex');
}

function createSeededRandom(seedInput) {
  let state = parseInt(stableHash(seedInput).slice(0, 8), 16) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function getSkillVariants(name) {
  const base = normalizeText(name).toLowerCase();
  if (!base) return [];

  const variants = new Set([
    base,
    base.replace(/\./g, ''),
    base.replace(/\s+/g, ''),
    base.replace(/[^\w+#]+/g, ' ').trim(),
  ]);

  const aliasMap = {
    javascript: ['js'],
    'node.js': ['nodejs', 'node js'],
    typescript: ['ts'],
    postgresql: ['postgres', 'postgresql', 'psql'],
    react: ['reactjs', 'react js'],
    'next.js': ['nextjs', 'next js'],
    python: ['py'],
  };

  for (const [target, aliases] of Object.entries(aliasMap)) {
    if (variants.has(target)) {
      aliases.forEach((alias) => variants.add(alias));
    }
  }

  return Array.from(variants).filter(Boolean);
}

function matchesSkill(text, skillName) {
  const haystack = normalizeText(text).toLowerCase();
  if (!haystack) return false;
  return getSkillVariants(skillName).some((variant) => haystack.includes(variant));
}

function collectSignals(profile) {
  const projects = toSafeArray(profile?.projectExperience);
  const work = toSafeArray(profile?.workExperience);
  const portfolioLinks = toSafeArray(profile?.portfolioLinks);
  const bio = normalizeText(profile?.bio);
  const github = normalizeText(profile?.social?.github);
  const linkedin = normalizeText(profile?.social?.linkedin);
  const hackathonCount = Number(profile?.hackathonExperience?.count) || 0;
  const hackathonSummary = normalizeText(profile?.hackathonExperience?.summary);
  const completion = Number(profile?.completion) || 0;

  return {
    bio,
    projects,
    work,
    portfolioLinks,
    github,
    linkedin,
    hackathonCount,
    hackathonSummary,
    completion,
  };
}

function hasSufficientAiScanSignal(profile) {
  const skills = toSafeArray(profile?.skills).filter((skill) => normalizeText(skill?.name));
  const signals = collectSignals(profile);
  return Boolean(
    skills.length &&
    (
      signals.bio ||
      signals.projects.length ||
      signals.work.length ||
      signals.portfolioLinks.length ||
      signals.github ||
      signals.linkedin ||
      signals.hackathonCount > 0 ||
      signals.hackathonSummary
    )
  );
}

function fingerprintProfile(profile) {
  const signals = collectSignals(profile);
  return stableHash(JSON.stringify({
    bio: signals.bio,
    completion: signals.completion,
    github: signals.github,
    linkedin: signals.linkedin,
    hackathonCount: signals.hackathonCount,
    hackathonSummary: signals.hackathonSummary,
    portfolioLinks: signals.portfolioLinks,
    projects: signals.projects,
    skills: toSafeArray(profile?.skills).map((skill) => ({
      name: normalizeText(skill?.name).toLowerCase(),
      level: Number(skill?.level) || 1,
    })),
    work: signals.work,
  }));
}

function buildSkillEvidence(skillName, profileSignals) {
  const evidence = [];

  const projectHit = profileSignals.projects.some((project) => (
    matchesSkill(project?.title, skillName) ||
    matchesSkill(project?.description, skillName) ||
    matchesSkill(project?.technologies, skillName)
  ));
  if (projectHit) evidence.push('Projects');

  const workHit = profileSignals.work.some((item) => (
    matchesSkill(item?.role, skillName) ||
    matchesSkill(item?.description, skillName) ||
    matchesSkill(item?.company, skillName)
  ));
  if (workHit) evidence.push('Work');

  if (matchesSkill(profileSignals.bio, skillName)) evidence.push('Bio');
  if (profileSignals.github) evidence.push('GitHub link');
  if (profileSignals.linkedin) evidence.push('LinkedIn');
  if (profileSignals.portfolioLinks.length) evidence.push('Portfolio');
  if (profileSignals.hackathonCount > 0 || profileSignals.hackathonSummary) evidence.push('Hackathons');

  return { evidence, projectHit, workHit };
}

function summarizeScan(skills) {
  if (!skills.length) {
    return 'Add skills and supporting experience to generate an estimate.';
  }

  const averageEstimate = skills.reduce((sum, skill) => sum + skill.estimatedLevel, 0) / skills.length;
  const highConfidence = skills.filter((skill) => skill.confidence >= 75).length;

  if (averageEstimate >= 4) {
    return `Reads as a strong execution profile with ${highConfidence || 'a few'} high-confidence signals across shipped work.`;
  }

  if (averageEstimate >= 3) {
    return 'Shows credible hands-on experience with room to strengthen proof around your most ambitious skills.';
  }

  return 'Looks early-stage today. More concrete project and work detail should raise confidence quickly.';
}

function generateAiScanSnapshot(profile, { userId, seed, scannedAt = new Date() }) {
  if (!hasSufficientAiScanSignal(profile)) {
    return null;
  }

  const profileSignals = collectSignals(profile);
  const profileFingerprint = fingerprintProfile(profile);
  const skills = toSafeArray(profile?.skills)
    .filter((skill) => normalizeText(skill?.name))
    .map((skill) => ({
      name: normalizeText(skill.name),
      claimedLevel: clamp(Math.round(Number(skill.level) || 1), 1, 5),
    }));

  const scanSkills = skills.map((skill, index) => {
    const random = createSeededRandom(`${userId}:${seed}:${profileFingerprint}:${skill.name}:${index}`);
    const { evidence, projectHit, workHit } = buildSkillEvidence(skill.name, profileSignals);

    const proofWeight =
      (projectHit ? 0.52 : 0) +
      (workHit ? 0.64 : 0) +
      (evidence.includes('Bio') ? 0.18 : 0) +
      (evidence.includes('Portfolio') ? 0.16 : 0) +
      (evidence.includes('GitHub link') ? 0.12 : 0) +
      Math.min(profileSignals.hackathonCount, 4) * 0.06 +
      (profileSignals.completion / 100) * 0.32;

    const variance = (random() - 0.5) * 1.05;
    const baseline = skill.claimedLevel - 0.55 + proofWeight + variance;
    const estimatedLevel = clamp(Math.round(baseline), 1, 5);
    const confidence = clamp(
      Math.round(
        38 +
        evidence.length * 9 +
        (projectHit ? 10 : 0) +
        (workHit ? 12 : 0) +
        profileSignals.completion * 0.15 +
        random() * 14
      ),
      32,
      92,
    );

    return {
      name: skill.name,
      claimedLevel: skill.claimedLevel,
      estimatedLevel,
      confidence,
      evidence: evidence.slice(0, 4),
    };
  });

  const overallRandom = createSeededRandom(`${userId}:${seed}:${profileFingerprint}:overall`);
  const overallScore = clamp(
    Math.round(
      (scanSkills.reduce((sum, skill) => sum + skill.estimatedLevel, 0) / Math.max(scanSkills.length, 1)) * 14 +
      (scanSkills.reduce((sum, skill) => sum + skill.confidence, 0) / Math.max(scanSkills.length, 1)) * 0.28 +
      ((overallRandom() - 0.5) * 8)
    ),
    0,
    100,
  );

  return {
    overallScore,
    summary: summarizeScan(scanSkills),
    lastScannedAt: scannedAt.toISOString(),
    skills: scanSkills,
  };
}

function buildAiScanState(profile, { userId, existingSeed, forceNewSeed = false }) {
  if (!hasSufficientAiScanSignal(profile)) {
    return {
      aiScanSeed: null,
      aiScanSnapshot: null,
      aiScanUpdatedAt: null,
    };
  }

  const aiScanUpdatedAt = new Date();
  const aiScanSeed = forceNewSeed || !existingSeed ? createSeed() : existingSeed;
  const aiScanSnapshot = generateAiScanSnapshot(profile, {
    userId,
    seed: aiScanSeed,
    scannedAt: aiScanUpdatedAt,
  });

  return {
    aiScanSeed,
    aiScanSnapshot,
    aiScanUpdatedAt,
  };
}

module.exports = {
  buildAiScanState,
  generateAiScanSnapshot,
  hasSufficientAiScanSignal,
};
