const { PrismaClient } = require('@prisma/client');
const { scoreFromMcq, scoreFromCaseResponses, clamp, scoreToTier } = require('../src/services/scoringService');

const prisma = new PrismaClient();

// ── Test Profiles ──────────────────────────────────────────────────────────────
// 12 diverse seed users across NUS/NTU/SMU/SUTD/SIT, different roles and tiers.
// firebaseUid is prefixed with "seed_" so they're never confused with real accounts.

function buildSkillScore(skills, assessment) {
  const levels = skills.map((s) => s.level);
  const avgSkillLevel = levels.length ? levels.reduce((a, b) => a + b, 0) / levels.length : 1;
  const sl = assessment.sliders;
  const sliderAvg = (sl.buildSpeed + sl.systemDesign + sl.debugging + sl.collaboration + sl.learningVelocity) / 5;
  const mcqRaw  = scoreFromMcq(assessment.mcq);
  const caseRaw = scoreFromCaseResponses(assessment.caseBased);
  const self = Math.round(
    ((avgSkillLevel - 1) / 4) * 25 +
    ((sliderAvg    - 1) / 4) * 25 +
    (mcqRaw  / 56) * 25 +
    (caseRaw / 26) * 25,
  );
  // No reviews yet → review score neutral 50 → combined = self*55% + 50*45%
  const combined = Math.round(self * 0.55 + 50 * 0.45);
  return clamp(combined, 0, 100);
}

const TEST_PROFILES = [
  {
    name: 'Aisha Rahman',
    email: 'seed.aisha@codecollab.test',
    firebaseUid: 'seed_aisha_001',
    university: 'NUS',
    bio: 'Year 2 CS student who loves building slick UIs. Currently learning React and TypeScript.',
    githubUrl: null,
    skills: [{ name: 'React', level: 2 }, { name: 'TypeScript', level: 1 }, { name: 'Figma', level: 2 }],
    academicYear: '2', major: 'Computer Science', hackathonExperienceCount: 1,
    projectExperience: [{ title: 'Personal Portfolio', description: 'Built a portfolio site with React', url: '', technologies: 'React, CSS' }],
    workExperience: [],
    assessment: {
      mcq: { rolePreference: 'frontend', strongestArea: 'ui', comfortAmbiguity: 'low', debuggingApproach: 'logs', teamworkStyle: 'contributor' },
      sliders: { buildSpeed: 2, systemDesign: 1, debugging: 2, collaboration: 3, learningVelocity: 4 },
      caseBased: { mvpTradeoff: 'build_fast_ignore_risk', prodIncident: 'wait_for_someone_else' },
    },
  },
  {
    name: 'Wei Jie Tan',
    email: 'seed.weijie@codecollab.test',
    firebaseUid: 'seed_weijie_002',
    university: 'NTU',
    bio: 'Backend dev who can set up a production-ready API fast. Love clean architecture and SQL.',
    githubUrl: null,
    skills: [{ name: 'Node.js', level: 3 }, { name: 'PostgreSQL', level: 3 }, { name: 'Docker', level: 2 }, { name: 'Redis', level: 2 }],
    academicYear: '3', major: 'Computer Engineering', hackathonExperienceCount: 3,
    projectExperience: [{ title: 'Campus Event App', description: 'REST API for a university event booking platform', url: '', technologies: 'Node.js, PostgreSQL, Docker' }],
    workExperience: [{ company: 'Shopee', role: 'Backend Intern', duration: 'May 2025 – Aug 2025', description: 'Built microservices for the promotions engine' }],
    assessment: {
      mcq: { rolePreference: 'backend', strongestArea: 'api', comfortAmbiguity: 'medium', debuggingApproach: 'isolate', teamworkStyle: 'contributor' },
      sliders: { buildSpeed: 3, systemDesign: 3, debugging: 3, collaboration: 3, learningVelocity: 3 },
      caseBased: { mvpTradeoff: 'define_scope_and_milestones', prodIncident: 'rollback_and_triage' },
    },
  },
  {
    name: 'Priya Nair',
    email: 'seed.priya@codecollab.test',
    firebaseUid: 'seed_priya_003',
    university: 'SMU',
    bio: 'Full-stack generalist who ships fast. Enjoy working across the stack and picking up new tools.',
    githubUrl: null,
    skills: [{ name: 'React', level: 3 }, { name: 'Python', level: 3 }, { name: 'AWS', level: 2 }, { name: 'FastAPI', level: 2 }],
    academicYear: '2', major: 'Information Systems', hackathonExperienceCount: 2,
    projectExperience: [{ title: 'Study Buddy Matcher', description: 'App that matches students for study sessions', url: '', technologies: 'React, FastAPI, PostgreSQL' }],
    workExperience: [],
    assessment: {
      mcq: { rolePreference: 'fullstack', strongestArea: 'api', comfortAmbiguity: 'medium', debuggingApproach: 'isolate', teamworkStyle: 'coordinator' },
      sliders: { buildSpeed: 3, systemDesign: 3, debugging: 3, collaboration: 4, learningVelocity: 3 },
      caseBased: { mvpTradeoff: 'define_scope_and_milestones', prodIncident: 'patch_without_rootcause' },
    },
  },
  {
    name: 'Marcus Lee',
    email: 'seed.marcus@codecollab.test',
    firebaseUid: 'seed_marcus_004',
    university: 'SUTD',
    bio: 'AI/ML engineer with a focus on computer vision and LLMs. Have shipped models to production at two internships.',
    githubUrl: null,
    skills: [{ name: 'Python', level: 5 }, { name: 'PyTorch', level: 4 }, { name: 'TensorFlow', level: 3 }, { name: 'LangChain', level: 4 }],
    academicYear: '4', major: 'Engineering Product Development', hackathonExperienceCount: 6,
    projectExperience: [
      { title: 'Object Detection Pipeline', description: 'Real-time detection system for factory defects', url: '', technologies: 'PyTorch, OpenCV, FastAPI' },
      { title: 'RAG Chatbot', description: 'LLM-powered Q&A system over internal docs', url: '', technologies: 'LangChain, OpenAI, Pinecone' },
    ],
    workExperience: [{ company: 'Sea (Garena)', role: 'ML Intern', duration: 'May 2025 – Dec 2025', description: 'Built recommendation model for game item shop' }],
    assessment: {
      mcq: { rolePreference: 'ai', strongestArea: 'ml', comfortAmbiguity: 'high', debuggingApproach: 'hypothesis', teamworkStyle: 'lead' },
      sliders: { buildSpeed: 4, systemDesign: 4, debugging: 5, collaboration: 3, learningVelocity: 5 },
      caseBased: { mvpTradeoff: 'define_scope_and_milestones', prodIncident: 'rollback_and_triage' },
    },
  },
  {
    name: 'Sarah Lim',
    email: 'seed.sarah@codecollab.test',
    firebaseUid: 'seed_sarah_005',
    university: 'NUS',
    bio: 'CS Year 4. DevOps and systems background. Can architect infra, write Terraform, and lead a team under pressure.',
    githubUrl: null,
    skills: [{ name: 'Go', level: 4 }, { name: 'Kubernetes', level: 4 }, { name: 'Terraform', level: 3 }, { name: 'Rust', level: 3 }],
    academicYear: '4', major: 'Computer Science', hackathonExperienceCount: 8,
    projectExperience: [
      { title: 'Distributed Cache', description: 'Built a Redis-compatible cache in Go as a university project', url: '', technologies: 'Go, gRPC, Docker' },
    ],
    workExperience: [{ company: 'GovTech', role: 'Cloud Engineer Intern', duration: 'Jan 2025 – Jun 2025', description: 'Migrated workloads to AWS with Terraform' }],
    assessment: {
      mcq: { rolePreference: 'backend', strongestArea: 'devops', comfortAmbiguity: 'high', debuggingApproach: 'hypothesis', teamworkStyle: 'lead' },
      sliders: { buildSpeed: 4, systemDesign: 5, debugging: 5, collaboration: 4, learningVelocity: 4 },
      caseBased: { mvpTradeoff: 'define_scope_and_milestones', prodIncident: 'rollback_and_triage' },
    },
  },
  {
    name: 'Zhen Wei',
    email: 'seed.zhenwei@codecollab.test',
    firebaseUid: 'seed_zhenwei_006',
    university: 'NTU',
    bio: 'Year 1 CS student, fresh and hungry. Know the basics and ready to learn fast at a hackathon.',
    githubUrl: null,
    skills: [{ name: 'JavaScript', level: 2 }, { name: 'HTML/CSS', level: 2 }, { name: 'Python', level: 1 }],
    academicYear: '1', major: 'Computer Science', hackathonExperienceCount: 0,
    projectExperience: [{ title: 'Calculator App', description: 'Simple web calculator built during a workshop', url: '', technologies: 'HTML, CSS, JavaScript' }],
    workExperience: [],
    assessment: {
      mcq: { rolePreference: 'frontend', strongestArea: 'ui', comfortAmbiguity: 'low', debuggingApproach: 'guess', teamworkStyle: 'follow' },
      sliders: { buildSpeed: 1, systemDesign: 1, debugging: 1, collaboration: 2, learningVelocity: 3 },
      caseBased: { mvpTradeoff: 'build_fast_ignore_risk', prodIncident: 'wait_for_someone_else' },
    },
  },
  {
    name: 'Kavitha Sharma',
    email: 'seed.kavitha@codecollab.test',
    firebaseUid: 'seed_kavitha_007',
    university: 'SIT',
    bio: 'Mobile developer specialising in cross-platform apps. Shipped 2 apps to the Play Store.',
    githubUrl: null,
    skills: [{ name: 'Flutter', level: 4 }, { name: 'React Native', level: 3 }, { name: 'Firebase', level: 3 }, { name: 'Dart', level: 4 }],
    academicYear: '3', major: 'Software Engineering', hackathonExperienceCount: 3,
    projectExperience: [{ title: 'Expense Tracker', description: 'Cross-platform budgeting app with offline sync', url: '', technologies: 'Flutter, Firebase, Dart' }],
    workExperience: [],
    assessment: {
      mcq: { rolePreference: 'frontend', strongestArea: 'ui', comfortAmbiguity: 'medium', debuggingApproach: 'logs', teamworkStyle: 'contributor' },
      sliders: { buildSpeed: 4, systemDesign: 2, debugging: 3, collaboration: 3, learningVelocity: 3 },
      caseBased: { mvpTradeoff: 'build_fast_ignore_risk', prodIncident: 'patch_without_rootcause' },
    },
  },
  {
    name: 'Benjamin Goh',
    email: 'seed.benjamin@codecollab.test',
    firebaseUid: 'seed_benjamin_008',
    university: 'NUS',
    bio: 'Business student who handles product, pitches, and Figma prototypes. Not a coder but brings the vision.',
    githubUrl: null,
    skills: [{ name: 'Figma', level: 3 }, { name: 'Notion', level: 3 }, { name: 'Webflow', level: 2 }],
    academicYear: '3', major: 'Business Analytics', hackathonExperienceCount: 2,
    projectExperience: [{ title: 'SocialLocal App', description: 'Product design and pitch deck for a local events discovery app', url: '', technologies: 'Figma, Notion' }],
    workExperience: [],
    assessment: {
      mcq: { rolePreference: 'product', strongestArea: 'ui', comfortAmbiguity: 'medium', debuggingApproach: 'logs', teamworkStyle: 'coordinator' },
      sliders: { buildSpeed: 2, systemDesign: 2, debugging: 1, collaboration: 5, learningVelocity: 3 },
      caseBased: { mvpTradeoff: 'define_scope_and_milestones', prodIncident: 'patch_without_rootcause' },
    },
  },
  {
    name: 'Rui Xiang Chen',
    email: 'seed.ruixiang@codecollab.test',
    firebaseUid: 'seed_ruixiang_009',
    university: 'NTU',
    bio: 'Full-stack + AI. Can wire up an LLM backend in a few hours and build the frontend for it. Love hackathons.',
    githubUrl: null,
    skills: [{ name: 'Python', level: 4 }, { name: 'React', level: 3 }, { name: 'FastAPI', level: 3 }, { name: 'OpenAI API', level: 4 }],
    academicYear: '3', major: 'Computer Science and Engineering', hackathonExperienceCount: 5,
    projectExperience: [{ title: 'AI Study Planner', description: 'GPT-powered study planner that adapts to your schedule', url: '', technologies: 'React, FastAPI, OpenAI' }],
    workExperience: [{ company: 'Grab', role: 'Software Intern', duration: 'May 2025 – Aug 2025', description: 'Built driver allocation microservice' }],
    assessment: {
      mcq: { rolePreference: 'fullstack', strongestArea: 'ml', comfortAmbiguity: 'high', debuggingApproach: 'hypothesis', teamworkStyle: 'lead' },
      sliders: { buildSpeed: 5, systemDesign: 3, debugging: 4, collaboration: 4, learningVelocity: 5 },
      caseBased: { mvpTradeoff: 'define_scope_and_milestones', prodIncident: 'rollback_and_triage' },
    },
  },
  {
    name: 'Fatimah Binte Ali',
    email: 'seed.fatimah@codecollab.test',
    firebaseUid: 'seed_fatimah_010',
    university: 'SMU',
    bio: 'Frontend dev with an eye for design. I make things look good AND work properly. Tailwind + React is my comfort zone.',
    githubUrl: null,
    skills: [{ name: 'React', level: 3 }, { name: 'Tailwind CSS', level: 4 }, { name: 'Figma', level: 3 }, { name: 'Next.js', level: 2 }],
    academicYear: '2', major: 'Computer Science', hackathonExperienceCount: 2,
    projectExperience: [{ title: 'Recipe Finder', description: 'Beautifully designed recipe discovery app', url: '', technologies: 'Next.js, Tailwind, Spoonacular API' }],
    workExperience: [],
    assessment: {
      mcq: { rolePreference: 'frontend', strongestArea: 'ui', comfortAmbiguity: 'medium', debuggingApproach: 'logs', teamworkStyle: 'contributor' },
      sliders: { buildSpeed: 3, systemDesign: 2, debugging: 3, collaboration: 4, learningVelocity: 3 },
      caseBased: { mvpTradeoff: 'build_fast_ignore_risk', prodIncident: 'patch_without_rootcause' },
    },
  },
  {
    name: 'Ethan Chia',
    email: 'seed.ethan@codecollab.test',
    firebaseUid: 'seed_ethan_011',
    university: 'SUTD',
    bio: 'Cybersecurity + systems programming. Write Rust and C++ for fun. Can build secure backends and break things (legally).',
    githubUrl: null,
    skills: [{ name: 'Rust', level: 4 }, { name: 'C++', level: 4 }, { name: 'Linux', level: 4 }, { name: 'Python', level: 3 }],
    academicYear: '4', major: 'Information Systems Technology and Design', hackathonExperienceCount: 5,
    projectExperience: [{ title: 'CTF Framework', description: 'Custom tooling for CTF competitions written in Rust', url: '', technologies: 'Rust, Linux, Python' }],
    workExperience: [{ company: 'CSIT', role: 'Security Intern', duration: 'Jan 2026 – Present', description: 'Vulnerability assessment and red team exercises' }],
    assessment: {
      mcq: { rolePreference: 'backend', strongestArea: 'devops', comfortAmbiguity: 'high', debuggingApproach: 'hypothesis', teamworkStyle: 'contributor' },
      sliders: { buildSpeed: 3, systemDesign: 4, debugging: 5, collaboration: 3, learningVelocity: 4 },
      caseBased: { mvpTradeoff: 'define_scope_and_milestones', prodIncident: 'rollback_and_triage' },
    },
  },
  {
    name: 'Jia Hui Wong',
    email: 'seed.jiahui@codecollab.test',
    firebaseUid: 'seed_jiahui_012',
    university: 'NUS',
    bio: "Data science student. Give me a messy dataset and I'll find a story. Comfortable with ML pipelines end-to-end.",
    githubUrl: null,
    skills: [{ name: 'Python', level: 4 }, { name: 'Pandas', level: 4 }, { name: 'Scikit-learn', level: 3 }, { name: 'SQL', level: 3 }, { name: 'Tableau', level: 2 }],
    academicYear: '3', major: 'Data Science and Analytics', hackathonExperienceCount: 3,
    projectExperience: [{ title: 'HDB Resale Price Predictor', description: 'Regression model predicting Singapore flat resale prices', url: '', technologies: 'Python, Sklearn, Streamlit' }],
    workExperience: [{ company: 'DBS Bank', role: 'Data Analyst Intern', duration: 'May 2025 – Aug 2025', description: 'Built dashboards for retail banking team' }],
    assessment: {
      mcq: { rolePreference: 'ai', strongestArea: 'data', comfortAmbiguity: 'medium', debuggingApproach: 'isolate', teamworkStyle: 'contributor' },
      sliders: { buildSpeed: 2, systemDesign: 3, debugging: 3, collaboration: 3, learningVelocity: 4 },
      caseBased: { mvpTradeoff: 'define_scope_and_milestones', prodIncident: 'patch_without_rootcause' },
    },
  },
];

const hackathons = [
  // ── LIVE NOW (happening right now) ───────────────────────────
  {
    name: 'SMU .Hack 2026',
    description:
      'SMU\'s flagship hackathon bringing together students to build innovative solutions for social impact. Open to all university students in Singapore.',
    url: 'https://smu.sg/dothack2026',
    startDate: new Date('2026-03-30T09:00:00+08:00'),
    endDate: new Date('2026-04-03T18:00:00+08:00'),
    registrationDeadline: new Date('2026-03-25T23:59:00+08:00'),
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
    startDate: new Date('2026-03-31T18:00:00+08:00'),
    endDate: new Date('2026-04-02T12:00:00+08:00'),
    registrationDeadline: new Date('2026-03-25T23:59:00+08:00'),
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
  // Delete seed teams first to avoid FK violations on hackathon cleanup
  const seedTeamNames = [
    'Team Alpha', 'StackOverflowers', 'MedTech Mavericks', 'PulseCheck',
    'Team Beta', 'NullPointers', 'Team Gamma', 'Neural Ninjas',
    'Pixel Pirates', 'GreenByte', 'ShipIt Squad',
  ];
  const seedTeams = await prisma.team.findMany({ where: { name: { in: seedTeamNames } }, select: { id: true } });
  if (seedTeams.length > 0) {
    const seedTeamIds = seedTeams.map((t) => t.id);
    await prisma.teamMember.deleteMany({ where: { teamId: { in: seedTeamIds } } });
    await prisma.team.deleteMany({ where: { id: { in: seedTeamIds } } });
    console.log('Cleared old seed teams.');
  }

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

  // ── Seed Test Profiles ─────────────────────────────────────
  console.log('\nSeeding test profiles...');
  let createdCount = 0;
  let skippedCount = 0;

  for (const tp of TEST_PROFILES) {
    const existing = await prisma.user.findFirst({ where: { email: tp.email } });
    if (existing) {
      console.log(`  Skipped (exists): ${tp.name}`);
      skippedCount++;
      continue;
    }

    const score = buildSkillScore(tp.skills, tp.assessment);
    const tier = scoreToTier(score);

    await prisma.user.create({
      data: {
        firebaseUid: tp.firebaseUid,
        email: tp.email,
        name: tp.name,
        university: tp.university,
        bio: tp.bio,
        profile: {
          create: {
            academicYear: tp.academicYear,
            major: tp.major,
            skills: tp.skills,
            assessmentResponses: tp.assessment,
            hackathonExperienceCount: tp.hackathonExperienceCount,
            projectExperience: tp.projectExperience,
            workExperience: tp.workExperience,
            onboardingCompleted: true,
            discoverable: true,
            completion: 100,
            internalSkillScore: score,
            internalSkillTier: tier,
          },
        },
      },
    });

    console.log(`  Created: ${tp.name} (${tier}, score ${score})`);
    createdCount++;
  }

  console.log(`Done. ${createdCount} test profiles created, ${skippedCount} skipped.`);

  // ── Seed Teams ─────────────────────────────────────────────
  console.log('\nSeeding teams...');

  const allUsers = await prisma.user.findMany({ select: { id: true, name: true } });
  const allHackathons = await prisma.hackathon.findMany({ select: { id: true, name: true } });

  if (allUsers.length < 1 || allHackathons.length < 1) {
    console.log('  Skipped teams (need at least 1 user and 1 hackathon).');
  } else {
    const teamSeeds = [
      // SMU .Hack 2026 — 2 teams
      { name: 'Team Alpha', hackathonName: 'SMU .Hack 2026', status: 'COMPETING', memberSlice: [0, 4] },
      { name: 'StackOverflowers', hackathonName: 'SMU .Hack 2026', status: 'COMPETING', memberSlice: [4, 8] },
      // NUS HealthHack 2026 — 2 teams
      { name: 'MedTech Mavericks', hackathonName: 'NUS HealthHack 2026', status: 'COMPETING', memberSlice: [1, 5] },
      { name: 'PulseCheck', hackathonName: 'NUS HealthHack 2026', status: 'FORMING', memberSlice: [8, 12] },
      // HackNUS 2026 — 2 teams
      { name: 'Team Beta', hackathonName: 'HackNUS 2026', status: 'FORMING', memberSlice: [3, 8] },
      { name: 'NullPointers', hackathonName: 'HackNUS 2026', status: 'FORMING', memberSlice: [0, 3] },
      // NTU AI Challenge — 2 teams
      { name: 'Team Gamma', hackathonName: 'NTU AI Challenge', status: 'FORMING', memberSlice: [9, 12] },
      { name: 'Neural Ninjas', hackathonName: 'NTU AI Challenge', status: 'FORMING', memberSlice: [3, 7] },
      // SUTD GameJam — 1 team
      { name: 'Pixel Pirates', hackathonName: 'SUTD GameJam', status: 'FORMING', memberSlice: [5, 9] },
      // SG Climate Hack — 1 team
      { name: 'GreenByte', hackathonName: 'SG Climate Hack', status: 'FORMING', memberSlice: [0, 5] },
      // BuildSG Online — 1 team
      { name: 'ShipIt Squad', hackathonName: 'BuildSG Online 2026', status: 'FORMING', memberSlice: [7, 11] },
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

      const teamMembers = allUsers.slice(ts.memberSlice[0], ts.memberSlice[1]);
      if (teamMembers.length === 0) continue;

      const team = await prisma.team.create({
        data: {
          name: ts.name,
          hackathonId: hackathon.id,
          createdById: teamMembers[0].id,
          status: ts.status,
          members: {
            create: teamMembers.map((u, idx) => ({
              userId: u.id,
              role: idx === 0 ? 'LEADER' : 'MEMBER',
            })),
          },
        },
      });
      console.log(`  Created: ${ts.name} (${teamMembers.length} members) for ${hackathon.name}`);
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
