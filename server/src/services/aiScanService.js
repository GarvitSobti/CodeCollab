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

function hasSufficientAiScanSignal(profile) {
  return toSafeArray(profile?.skills).some((skill) => normalizeText(skill?.name));
}

function fingerprintProfile(profile) {
  return stableHash(JSON.stringify({
    skills: toSafeArray(profile?.skills).map((skill) => ({
      name: normalizeText(skill?.name).toLowerCase(),
      level: Number(skill?.level) || 1,
    })),
  }));
}

function summarizeScan(skills) {
  if (!skills.length) {
    return 'Add a few skills and the app will auto-fill estimated actual levels.';
  }

  const biggestGap = [...skills].sort(
    (left, right) => Math.abs(right.claimedLevel - right.estimatedLevel) - Math.abs(left.claimedLevel - left.estimatedLevel),
  )[0];

  if (!biggestGap) {
    return 'The app generated a simple claimed-vs-estimated comparison for your listed skills.';
  }

  if (biggestGap.estimatedLevel < biggestGap.claimedLevel) {
    return `Biggest gap right now: ${biggestGap.name} was listed at ${biggestGap.claimedLevel}/5, but the estimate lands at ${biggestGap.estimatedLevel}/5.`;
  }

  if (biggestGap.estimatedLevel > biggestGap.claimedLevel) {
    return `${biggestGap.name} comes out stronger than listed: ${biggestGap.claimedLevel}/5 claimed vs ${biggestGap.estimatedLevel}/5 estimated.`;
  }

  return `The estimate mostly matches what was claimed, starting with ${biggestGap.name}.`;
}

function getEstimatedLevel(claimedLevel, random) {
  const roll = random();
  let delta = 0;

  if (roll < 0.16) delta = -2;
  else if (roll < 0.5) delta = -1;
  else if (roll < 0.82) delta = 0;
  else delta = 1;

  return clamp(claimedLevel + delta, 1, 5);
}

function generateAiScanSnapshot(profile, { userId, seed, scannedAt = new Date() }) {
  if (!hasSufficientAiScanSignal(profile)) {
    return null;
  }

  const profileFingerprint = fingerprintProfile(profile);
  const skills = toSafeArray(profile?.skills)
    .filter((skill) => normalizeText(skill?.name))
    .map((skill) => ({
      name: normalizeText(skill.name),
      claimedLevel: clamp(Math.round(Number(skill.level) || 1), 1, 5),
    }));

  const scanSkills = skills.map((skill, index) => {
    const random = createSeededRandom(`${userId}:${seed}:${profileFingerprint}:${skill.name}:${index}`);
    const estimatedLevel = getEstimatedLevel(skill.claimedLevel, random);
    const confidence = clamp(
      Math.round(62 + random() * 32),
      55,
      94,
    );

    return {
      name: skill.name,
      claimedLevel: skill.claimedLevel,
      estimatedLevel,
      confidence,
      evidence: [],
    };
  });

  const overallRandom = createSeededRandom(`${userId}:${seed}:${profileFingerprint}:overall`);
  const overallScore = clamp(
    Math.round(
      (scanSkills.reduce((sum, skill) => sum + skill.estimatedLevel, 0) / Math.max(scanSkills.length, 1)) * 18 +
      6 +
      ((overallRandom() - 0.5) * 10)
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
