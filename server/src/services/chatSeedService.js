const prisma = require('../config/prisma');
const { normalizePair } = require('../utils/matchUtils');

const DEMO_USERS = [
  {
    firebaseUid: 'seed-jamie',
    email: 'jamie@codecollab.demo',
    name: 'Jamie Tan',
    bio: 'Frontend lead who ships polished UIs fast.',
    university: 'NUS',
  },
  {
    firebaseUid: 'seed-weiming',
    email: 'weiming@codecollab.demo',
    name: 'Wei Ming Chen',
    bio: 'ML engineer focused on practical prototypes.',
    university: 'NTU',
  },
  {
    firebaseUid: 'seed-priya',
    email: 'priya@codecollab.demo',
    name: 'Priya Sharma',
    bio: 'Backend engineer who likes clean APIs and schemas.',
    university: 'SMU',
  },
  {
    firebaseUid: 'seed-alex',
    email: 'alex@codecollab.demo',
    name: 'Alex Ng',
    bio: 'Cross-platform engineer with strong mobile instincts.',
    university: 'SUTD',
  },
  {
    firebaseUid: 'seed-sarah',
    email: 'sarah@codecollab.demo',
    name: 'Sarah Lim',
    bio: 'Systems-focused senior who mentors younger builders.',
    university: 'NUS',
  },
  {
    firebaseUid: 'seed-emily',
    email: 'emily@codecollab.demo',
    name: 'Emily Huang',
    bio: 'Full-stack builder who likes polished product details.',
    university: 'SMU',
  },
];

async function ensureSeedUsers() {
  for (const user of DEMO_USERS) {
    await prisma.user.upsert({
      where: { firebaseUid: user.firebaseUid },
      update: { name: user.name, email: user.email },
      create: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        bio: user.bio,
        university: user.university,
      },
    });
  }
}

async function ensureDemoMatchesForUser(firebaseUid) {
  await ensureSeedUsers();

  // Get the current user's database ID
  const currentUser = await prisma.user.findUnique({
    where: { firebaseUid },
    select: { id: true },
  });
  if (!currentUser) return;

  for (const demoUser of DEMO_USERS) {
    // Get the demo user's database ID
    const demoDbUser = await prisma.user.findUnique({
      where: { firebaseUid: demoUser.firebaseUid },
      select: { id: true },
    });
    if (!demoDbUser) continue;

    const [userOneId, userTwoId] = normalizePair(currentUser.id, demoDbUser.id);
    await prisma.match.upsert({
      where: { userOneId_userTwoId: { userOneId, userTwoId } },
      update: {},
      create: {
        userOneId,
        userTwoId,
        status: 'accepted',
        createdByUserId: currentUser.id,
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
