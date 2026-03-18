const { Match, User } = require('../models');

const DEMO_USERS = [
  {
    id: 'jamie',
    firebaseUid: 'seed-jamie',
    email: 'jamie@codecollab.demo',
    name: 'Jamie Tan',
    avatarUrl: null,
    role: 'student',
    bio: 'Frontend lead who ships polished UIs fast.',
    university: 'NUS',
    year: 'Year 2',
    initials: 'JT',
    accentColor: 'linear-gradient(135deg,#ff6b6b,#ff8a65)',
    isSeed: true,
  },
  {
    id: 'weiming',
    firebaseUid: 'seed-weiming',
    email: 'weiming@codecollab.demo',
    name: 'Wei Ming Chen',
    avatarUrl: null,
    role: 'student',
    bio: 'ML engineer focused on practical prototypes.',
    university: 'NTU',
    year: 'Year 3',
    initials: 'WM',
    accentColor: 'linear-gradient(135deg,#42a5f5,#1e88e5)',
    isSeed: true,
  },
  {
    id: 'priya',
    firebaseUid: 'seed-priya',
    email: 'priya@codecollab.demo',
    name: 'Priya Sharma',
    avatarUrl: null,
    role: 'student',
    bio: 'Backend engineer who likes clean APIs and schemas.',
    university: 'SMU',
    year: 'Year 2',
    initials: 'PS',
    accentColor: 'linear-gradient(135deg,#b39ddb,#7e57c2)',
    isSeed: true,
  },
  {
    id: 'alex',
    firebaseUid: 'seed-alex',
    email: 'alex@codecollab.demo',
    name: 'Alex Ng',
    avatarUrl: null,
    role: 'student',
    bio: 'Cross-platform engineer with strong mobile instincts.',
    university: 'SUTD',
    year: 'Year 3',
    initials: 'AN',
    accentColor: 'linear-gradient(135deg,#66bb6a,#43a047)',
    isSeed: true,
  },
  {
    id: 'sarah',
    firebaseUid: 'seed-sarah',
    email: 'sarah@codecollab.demo',
    name: 'Sarah Lim',
    avatarUrl: null,
    role: 'student',
    bio: 'Systems-focused senior who mentors younger builders.',
    university: 'NUS',
    year: 'Year 4',
    initials: 'SL',
    accentColor: 'linear-gradient(135deg,#ffca28,#ff8a65)',
    isSeed: true,
  },
  {
    id: 'emily',
    firebaseUid: 'seed-emily',
    email: 'emily@codecollab.demo',
    name: 'Emily Huang',
    avatarUrl: null,
    role: 'student',
    bio: 'Full-stack builder who likes polished product details.',
    university: 'SMU',
    year: 'Year 3',
    initials: 'EH',
    accentColor: 'linear-gradient(135deg,#ff8a65,#ff6b6b)',
    isSeed: true,
  },
];

function normalizePair(a, b) {
  return [a, b].sort();
}

async function ensureSeedUsers() {
  for (const user of DEMO_USERS) {
    // SQLite will frequently lock under parallel writes during local dev.
    await User.upsert(user);
  }
}

async function ensureDemoMatchesForUser(userId) {
  await ensureSeedUsers();
  for (const demoUser of DEMO_USERS) {
    const [userOneId, userTwoId] = normalizePair(userId, demoUser.id);
    await Match.findOrCreate({
      where: { userOneId, userTwoId },
      defaults: {
        userOneId,
        userTwoId,
        status: 'accepted',
        createdByUserId: userId,
      },
    });
  }
}

module.exports = {
  DEMO_USERS,
  ensureSeedUsers,
  ensureDemoMatchesForUser,
  normalizePair,
};
