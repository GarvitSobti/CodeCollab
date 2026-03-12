const { randomUUID } = require('crypto');

const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER'
};

const HACKATHON_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

const companies = new Map([
  ['comp-001', {
    id: 'comp-001',
    name: 'InnovateX Labs',
    website: 'https://innovatex.example',
    email: 'events@innovatex.example',
    logoUrl: '',
    description: 'Enterprise innovation partner for student hackathons.'
  }]
]);

const admins = [
  {
    id: 'adm-001',
    email: 'superadmin@innovatex.example',
    password: 'Admin@123',
    role: ROLES.SUPER_ADMIN,
    companyId: 'comp-001',
    fullName: 'Super Admin'
  },
  {
    id: 'adm-002',
    email: 'viewer@innovatex.example',
    password: 'Admin@123',
    role: ROLES.VIEWER,
    companyId: 'comp-001',
    fullName: 'Viewer User'
  }
];

const hackathons = [
  {
    id: 'hack-001',
    companyId: 'comp-001',
    eventName: 'InnovateX FutureBuild 2026',
    description: 'Build solutions for sustainable smart cities.',
    registrationStartDate: '2026-03-01',
    registrationEndDate: '2026-03-30',
    hackathonStartDate: '2026-04-10',
    hackathonEndDate: '2026-04-12',
    venue: 'HYBRID',
    teamSizeMin: 2,
    teamSizeMax: 5,
    categories: ['AI/ML', 'Sustainability', 'FinTech'],
    prizes: [
      { title: 'Grand Prize', amount: 8000 },
      { title: 'Runner Up', amount: 3000 }
    ],
    sponsors: [
      { name: 'CloudNova', logoUrl: '', link: 'https://cloudnova.example' }
    ],
    faq: [
      { question: 'Who can join?', answer: 'University students and fresh graduates.' }
    ],
    registrationRequirements: ['Student ID', 'Resume'],
    status: HACKATHON_STATUS.PUBLISHED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archivedAt: null,
    clonedFromId: null
  }
];

const auditLogs = [];

const participantSnapshotByHackathon = {
  'hack-001': {
    registrationsByDay: [
      { date: '2026-03-01', registrations: 14, views: 240, clicks: 96 },
      { date: '2026-03-02', registrations: 18, views: 280, clicks: 110 },
      { date: '2026-03-03', registrations: 23, views: 320, clicks: 140 },
      { date: '2026-03-04', registrations: 28, views: 350, clicks: 156 },
      { date: '2026-03-05', registrations: 34, views: 390, clicks: 170 }
    ],
    demographics: {
      universityDistribution: [
        { name: 'NUS', value: 35 },
        { name: 'NTU', value: 28 },
        { name: 'SMU', value: 19 },
        { name: 'SUTD', value: 12 },
        { name: 'Others', value: 6 }
      ],
      yearBreakdown: [
        { label: 'Year 1', value: 18 },
        { label: 'Year 2', value: 31 },
        { label: 'Year 3', value: 29 },
        { label: 'Year 4', value: 22 }
      ],
      majorBreakdown: [
        { label: 'Computer Science', value: 44 },
        { label: 'Information Systems', value: 21 },
        { label: 'Engineering', value: 24 },
        { label: 'Business', value: 11 }
      ],
      teamVsIndividual: [
        { label: 'Team', value: 72 },
        { label: 'Individual', value: 28 }
      ]
    },
    skills: {
      commonSkills: [
        { skill: 'React', value: 48 },
        { skill: 'Python', value: 44 },
        { skill: 'Node.js', value: 38 },
        { skill: 'PostgreSQL', value: 25 },
        { skill: 'Docker', value: 21 }
      ],
      averageSkillLevel: 3.6,
      gapAreas: ['System Design', 'MLOps'],
      stackPreferences: [
        { stack: 'MERN', value: 35 },
        { stack: 'Python + FastAPI', value: 27 },
        { stack: 'Serverless', value: 18 },
        { stack: 'Other', value: 20 }
      ]
    },
    engagement: {
      profileCompletionRate: 82,
      teamFormationProgress: 68,
      activeParticipants: 74,
      messageFrequencyPerDay: 426
    },
    talentInsights: {
      topPerformers: [
        { name: 'Alex Tan', score: 96 },
        { name: 'Priya Nair', score: 93 },
        { name: 'Wei Ming', score: 90 }
      ],
      skillDiversityScore: 8.1,
      mostActiveParticipants: 27
    }
  }
};

function findAdminByEmail(email) {
  return admins.find((admin) => admin.email.toLowerCase() === String(email || '').toLowerCase());
}

function getCompanyById(companyId) {
  return companies.get(companyId) || null;
}

function updateCompanyProfile(companyId, patch) {
  const existing = companies.get(companyId);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  companies.set(companyId, updated);
  return updated;
}

function listHackathonsByCompany(companyId) {
  return hackathons.filter((hackathon) => hackathon.companyId === companyId);
}

function getHackathonById(id) {
  return hackathons.find((hackathon) => hackathon.id === id) || null;
}

function createHackathon(companyId, payload) {
  const now = new Date().toISOString();
  const hackathon = {
    id: randomUUID(),
    companyId,
    eventName: payload.eventName,
    description: payload.description || '',
    registrationStartDate: payload.registrationStartDate || null,
    registrationEndDate: payload.registrationEndDate || null,
    hackathonStartDate: payload.hackathonStartDate || null,
    hackathonEndDate: payload.hackathonEndDate || null,
    venue: payload.venue || 'VIRTUAL',
    teamSizeMin: Number(payload.teamSizeMin || 1),
    teamSizeMax: Number(payload.teamSizeMax || 5),
    categories: payload.categories || [],
    prizes: payload.prizes || [],
    sponsors: payload.sponsors || [],
    faq: payload.faq || [],
    registrationRequirements: payload.registrationRequirements || [],
    status: payload.status || HACKATHON_STATUS.DRAFT,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    clonedFromId: null
  };
  hackathons.unshift(hackathon);
  return hackathon;
}

function updateHackathon(id, payload) {
  const index = hackathons.findIndex((hackathon) => hackathon.id === id);
  if (index < 0) return null;
  const updated = {
    ...hackathons[index],
    ...payload,
    updatedAt: new Date().toISOString()
  };
  hackathons[index] = updated;
  return updated;
}

function deleteHackathon(id) {
  const index = hackathons.findIndex((hackathon) => hackathon.id === id);
  if (index < 0) return false;
  hackathons.splice(index, 1);
  return true;
}

function cloneHackathon(id, companyId) {
  const source = getHackathonById(id);
  if (!source) return null;
  const now = new Date().toISOString();
  const clone = {
    ...source,
    id: randomUUID(),
    companyId,
    status: HACKATHON_STATUS.DRAFT,
    eventName: `${source.eventName} (Clone)`,
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
    clonedFromId: source.id
  };
  hackathons.unshift(clone);
  return clone;
}

function archiveHackathon(id) {
  return updateHackathon(id, {
    status: HACKATHON_STATUS.ARCHIVED,
    archivedAt: new Date().toISOString()
  });
}

function publishHackathon(id) {
  return updateHackathon(id, {
    status: HACKATHON_STATUS.PUBLISHED
  });
}

function getAnalyticsForHackathon(hackathonId) {
  return participantSnapshotByHackathon[hackathonId] || {
    registrationsByDay: [],
    demographics: {
      universityDistribution: [],
      yearBreakdown: [],
      majorBreakdown: [],
      teamVsIndividual: []
    },
    skills: {
      commonSkills: [],
      averageSkillLevel: 0,
      gapAreas: [],
      stackPreferences: []
    },
    engagement: {
      profileCompletionRate: 0,
      teamFormationProgress: 0,
      activeParticipants: 0,
      messageFrequencyPerDay: 0
    },
    talentInsights: {
      topPerformers: [],
      skillDiversityScore: 0,
      mostActiveParticipants: 0
    }
  };
}

function pushAuditLog(entry) {
  auditLogs.unshift({
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry
  });
}

function listAuditLogs(companyId) {
  return auditLogs.filter((log) => log.companyId === companyId);
}

module.exports = {
  ROLES,
  HACKATHON_STATUS,
  findAdminByEmail,
  getCompanyById,
  updateCompanyProfile,
  listHackathonsByCompany,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  cloneHackathon,
  archiveHackathon,
  publishHackathon,
  getAnalyticsForHackathon,
  pushAuditLog,
  listAuditLogs
};
