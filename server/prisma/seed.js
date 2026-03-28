const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const hackathons = [
  // ── LIVE NOW (happening right now) ───────────────────────────
  {
    name: 'SMU .Hack 2026',
    description:
      'SMU\'s flagship hackathon bringing together students to build innovative solutions for social impact. Open to all university students in Singapore.',
    url: 'https://smu.sg/dothack2026',
    startDate: new Date('2026-03-27T09:00:00+08:00'),
    endDate: new Date('2026-03-29T18:00:00+08:00'),
    registrationDeadline: new Date('2026-03-20T23:59:00+08:00'),
    location: 'SMU Campus, 81 Victoria Street',
    isOnline: false,
    minTeamSize: 2,
    maxTeamSize: 5,
    difficultyLevel: 'INTERMEDIATE',
    tags: ['Web', 'AI/ML', 'Social Impact'],
  },
  {
    name: 'NUS HealthHack 2026',
    description:
      'A 48-hour health-tech hackathon co-organised by NUS Computing and NUS Medicine. Build solutions that improve healthcare delivery in Southeast Asia.',
    url: 'https://healthhack.nus.edu.sg',
    startDate: new Date('2026-03-26T18:00:00+08:00'),
    endDate: new Date('2026-03-29T12:00:00+08:00'),
    registrationDeadline: new Date('2026-03-18T23:59:00+08:00'),
    location: 'NUS University Town',
    isOnline: false,
    minTeamSize: 3,
    maxTeamSize: 5,
    difficultyLevel: 'ADVANCED',
    tags: ['HealthTech', 'AI/ML', 'Data Analytics'],
  },

  // ── OPEN REGISTRATION (upcoming, reg deadline in the future) ─
  {
    name: 'HackNUS 2026',
    description:
      'NUS Computing\'s annual hackathon focused on EdTech and FinTech. Build products that reshape education and finance for Southeast Asia.',
    url: 'https://hacknus.com',
    startDate: new Date('2026-04-18T09:00:00+08:00'),
    endDate: new Date('2026-04-20T18:00:00+08:00'),
    registrationDeadline: new Date('2026-04-10T23:59:00+08:00'),
    location: 'NUS Computing, COM1',
    isOnline: false,
    minTeamSize: 2,
    maxTeamSize: 4,
    difficultyLevel: 'INTERMEDIATE',
    tags: ['EdTech', 'FinTech', 'Open Track'],
  },
  {
    name: 'NTU AI Challenge',
    description:
      'A 48-hour AI/ML focused hackathon hosted by NTU SCSE. Tackle real-world problems using computer vision, NLP, and generative AI.',
    url: 'https://ntu-ai-challenge.sg',
    startDate: new Date('2026-04-25T09:00:00+08:00'),
    endDate: new Date('2026-04-27T18:00:00+08:00'),
    registrationDeadline: new Date('2026-04-15T23:59:00+08:00'),
    location: 'NTU The Hive',
    isOnline: false,
    minTeamSize: 3,
    maxTeamSize: 5,
    difficultyLevel: 'ADVANCED',
    tags: ['AI/ML', 'Computer Vision', 'NLP'],
  },

  // ── COMING SOON (reg deadline already passed, but event hasn't started) ─
  {
    name: 'SUTD GameJam',
    description:
      'A weekend game development jam at SUTD. Design, build, and ship a playable game in 36 hours. All skill levels welcome!',
    url: 'https://sutd-gamejam.dev',
    startDate: new Date('2026-04-04T10:00:00+08:00'),
    endDate: new Date('2026-04-05T22:00:00+08:00'),
    registrationDeadline: new Date('2026-03-25T23:59:00+08:00'),
    location: 'SUTD Campus',
    isOnline: false,
    minTeamSize: 1,
    maxTeamSize: 4,
    difficultyLevel: 'BEGINNER',
    tags: ['Gaming', 'Creative', 'Mobile'],
  },
  {
    name: 'SG Climate Hack',
    description:
      'A cross-university hackathon tackling climate change with technology. Sponsored by GovTech and NUS Enterprise. Cash prizes and incubation opportunities.',
    url: 'https://sgclimatehack.org',
    startDate: new Date('2026-05-16T09:00:00+08:00'),
    endDate: new Date('2026-05-18T17:00:00+08:00'),
    registrationDeadline: new Date('2026-05-06T23:59:00+08:00'),
    location: 'LaunchPad @ one-north',
    isOnline: false,
    minTeamSize: 2,
    maxTeamSize: 5,
    difficultyLevel: 'INTERMEDIATE',
    tags: ['Sustainability', 'IoT', 'Data Analytics'],
  },
  {
    name: 'BuildSG Online 2026',
    description:
      'Singapore\'s largest fully-online hackathon. Build anything — no theme restrictions. Compete from anywhere for 72 hours.',
    url: 'https://buildsg.online',
    startDate: new Date('2026-06-06T00:00:00+08:00'),
    endDate: new Date('2026-06-08T23:59:00+08:00'),
    registrationDeadline: new Date('2026-05-30T23:59:00+08:00'),
    location: 'Online',
    isOnline: true,
    minTeamSize: 1,
    maxTeamSize: 5,
    difficultyLevel: 'BEGINNER',
    tags: ['Open Track', 'Web', 'Mobile', 'DevOps'],
  },
];

async function main() {
  // Remove old seed data so dates are refreshed
  const oldNames = [
    'SMU .Hack 2025', 'HackNUS 2025', 'NTU AI Challenge',
    'SUTD GameJam', 'SG Climate Hack', 'BuildSG Online 2025',
    'SMU .Hack 2026', 'NUS HealthHack 2026', 'HackNUS 2026',
    'BuildSG Online 2026',
  ];
  await prisma.hackathon.deleteMany({ where: { name: { in: oldNames } } });
  console.log('Cleared old seed hackathons.');

  console.log('Seeding hackathons...');
  for (const h of hackathons) {
    const existing = await prisma.hackathon.findFirst({
      where: { name: h.name },
    });
    if (!existing) {
      await prisma.hackathon.create({ data: h });
      console.log(`  Created: ${h.name}`);
    } else {
      console.log(`  Skipped (exists): ${h.name}`);
    }
  }

  const count = await prisma.hackathon.count();
  console.log(`Done. ${count} hackathons in database.`);

  // ── Seed Teams ─────────────────────────────────────────────
  console.log('\nSeeding teams...');

  const allUsers = await prisma.user.findMany({ select: { id: true, name: true } });
  const allHackathons = await prisma.hackathon.findMany({ select: { id: true, name: true } });

  if (allUsers.length < 1 || allHackathons.length < 1) {
    console.log('  Skipped teams (need at least 1 user and 1 hackathon).');
  } else {
    const teamSeeds = [
      { name: 'Team Alpha', hackathonName: 'SMU .Hack 2026', status: 'COMPETING' },
      { name: 'Team Beta', hackathonName: 'HackNUS 2026', status: 'FORMING' },
      { name: 'Team Gamma', hackathonName: 'NTU AI Challenge', status: 'FORMING' },
    ];

    for (const ts of teamSeeds) {
      const existing = await prisma.team.findFirst({ where: { name: ts.name } });
      if (existing) {
        console.log(`  Skipped (exists): ${ts.name}`);
        continue;
      }

      const hackathon = allHackathons.find((h) => h.name === ts.hackathonName);
      if (!hackathon) {
        console.log(`  Skipped (no hackathon "${ts.hackathonName}"): ${ts.name}`);
        continue;
      }

      const leader = allUsers[0];
      const team = await prisma.team.create({
        data: {
          name: ts.name,
          hackathonId: hackathon.id,
          createdById: leader.id,
          status: ts.status,
          members: {
            create: allUsers.map((u, idx) => ({
              userId: u.id,
              role: idx === 0 ? 'LEADER' : 'MEMBER',
            })),
          },
        },
      });
      console.log(`  Created: ${ts.name} (${allUsers.length} members) for ${hackathon.name}`);
    }

    const teamCount = await prisma.team.count();
    console.log(`Done. ${teamCount} teams in database.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
