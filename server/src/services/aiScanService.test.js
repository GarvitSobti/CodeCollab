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
    expect(hasSufficientAiScanSignal({ skills: [{ name: 'React', level: 4 }] })).toBe(false);
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
      projectExperience: [
        {
          title: 'Backend control plane',
          description: 'Built Node.js services and CI deployment flows.',
          technologies: 'Node.js, Docker, PostgreSQL',
        },
      ],
    });

    const first = generateAiScanSnapshot(base, { userId: 'user-1', seed: 'seed-1', scannedAt: new Date('2026-04-03T10:30:00.000Z') });
    const second = generateAiScanSnapshot(changed, { userId: 'user-1', seed: 'seed-1', scannedAt: new Date('2026-04-03T10:30:00.000Z') });

    expect(second).not.toEqual(first);
  });

  test('reseeded scan state changes on manual rescan', () => {
    const profile = createProfile();
    const first = buildAiScanState(profile, { userId: 'user-1', existingSeed: 'seed-1', forceNewSeed: false });
    const second = buildAiScanState(profile, { userId: 'user-1', existingSeed: 'seed-1', forceNewSeed: true });

    expect(second.aiScanSeed).not.toEqual(first.aiScanSeed);
    expect(second.aiScanSnapshot).not.toEqual(first.aiScanSnapshot);
  });
});
