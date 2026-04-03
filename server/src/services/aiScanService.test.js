const {
  buildAiScanState,
  generateAiScanSnapshot,
  hasSufficientAiScanSignal,
} = require('./aiScanService');

function createProfile(overrides = {}) {
  return {
    bio: 'Built React dashboards and Node APIs for hackathons.',
    completion: 82,
    skills: [
      { name: 'React', level: 4 },
      { name: 'Node.js', level: 3 },
    ],
    projectExperience: [
      {
        title: 'Collab board',
        description: 'Built a React and Node.js coordination app.',
        technologies: 'React, Node.js, PostgreSQL',
      },
    ],
    workExperience: [
      {
        company: 'Acme',
        role: 'Frontend Intern',
        description: 'Implemented React components and API integration.',
      },
    ],
    portfolioLinks: [{ label: 'Portfolio', url: 'https://example.com' }],
    social: {
      github: 'https://github.com/example',
      linkedin: 'https://linkedin.com/in/example',
    },
    hackathonExperience: {
      count: 2,
      summary: 'Built MVPs under tight deadlines.',
    },
    ...overrides,
  };
}

describe('aiScanService', () => {
  test('detects whether a profile has enough signal', () => {
    expect(hasSufficientAiScanSignal(createProfile())).toBe(true);
    expect(hasSufficientAiScanSignal({ skills: [{ name: 'React', level: 4 }] })).toBe(true);
    expect(hasSufficientAiScanSignal({ skills: [] })).toBe(false);
  });

  test('returns deterministic output for the same profile and seed', () => {
    const profile = createProfile();
    const scannedAt = new Date('2026-04-03T10:30:00.000Z');
    const first = generateAiScanSnapshot(profile, { userId: 'user-1', seed: 'seed-1', scannedAt });
    const second = generateAiScanSnapshot(profile, { userId: 'user-1', seed: 'seed-1', scannedAt });

    expect(second).toEqual(first);
  });

  test('changes output when the profile content changes', () => {
    const base = createProfile();
    const changed = createProfile({
      skills: [
        { name: 'React', level: 2 },
        { name: 'Node.js', level: 5 },
      ],
    });

    const first = generateAiScanSnapshot(base, { userId: 'user-1', seed: 'seed-1', scannedAt: new Date('2026-04-03T10:30:00.000Z') });
    const second = generateAiScanSnapshot(changed, { userId: 'user-1', seed: 'seed-1', scannedAt: new Date('2026-04-03T10:30:00.000Z') });

    expect(second).not.toEqual(first);
  });

  test('keeps estimated levels in range and can differ from claimed levels', () => {
    const scan = generateAiScanSnapshot(createProfile(), {
      userId: 'user-1',
      seed: 'seed-1',
      scannedAt: new Date('2026-04-03T10:30:00.000Z'),
    });

    expect(scan.skills.every((skill) => skill.estimatedLevel >= 1 && skill.estimatedLevel <= 5)).toBe(true);
    expect(scan.skills.some((skill) => skill.estimatedLevel !== skill.claimedLevel)).toBe(true);
  });

  test('reuses an existing seed for automatic scans', () => {
    const profile = createProfile();
    const first = buildAiScanState(profile, { userId: 'user-1', existingSeed: 'seed-1', forceNewSeed: false });
    const second = buildAiScanState(profile, { userId: 'user-1', existingSeed: 'seed-1', forceNewSeed: false });

    expect(second.aiScanSeed).toEqual(first.aiScanSeed);
    expect(second.aiScanSnapshot).toEqual(first.aiScanSnapshot);
  });
});
