import User from '../models/User';

const rawTeamsData = [
  {
    id: 'alpha',
    emoji: '🌿',
    name: 'Team Alpha',
    status: 'Active',
    statusColor: 'var(--mint)',
    statusBg: 'rgba(102,187,106,0.12)',
    description:
      'Building CodeCollab - the ultimate hackathon teammate finder for Singapore university students. Competing in SMU .Hack 2025.',
    tagline: 'Strong progress this sprint with core features nearly demo ready.',
    stats: [
      { val: '4', lbl: 'Members', c: 'var(--coral)' },
      { val: '3', lbl: 'Hackathons', c: 'var(--mint)' },
      { val: '4.8', lbl: 'Avg Rating', c: 'var(--honey)', prefix: '★ ' },
      { val: '2', lbl: 'Wins', c: 'var(--sky)' },
    ],
    sprint: [
      { emoji: '✅', title: 'API Matching Algorithm', sub: 'Assigned to Wei Ming · Completed', bg: 'rgba(102,187,106,0.12)' },
      { emoji: '🔄', title: 'Swipe UI Component', sub: 'Assigned to Jamie · In Progress', bg: 'rgba(255,138,101,0.12)' },
      { emoji: '📝', title: 'Database Migration', sub: 'Assigned to Priya · In Progress', bg: 'rgba(179,157,219,0.12)' },
      { emoji: '⏳', title: 'Pitch Deck', sub: 'Assigned to You · Pending', bg: 'rgba(66,165,245,0.12)' },
    ],
    members: [
      { id: 'jamie', initials: 'JT', name: 'Jamie Tan', uni: 'NUS · CS Year 2', role: 'Frontend Lead', roleColor: { bg: 'rgba(255,107,107,0.1)', c: 'var(--coral)' }, gradient: 'linear-gradient(135deg,#ff6b6b,#ff8a65)', skills: ['React', 'TypeScript', 'Figma'], progress: 87 },
      { id: 'weiming', initials: 'WM', name: 'Wei Ming Chen', uni: 'NTU · CE Year 3', role: 'ML Engineer', roleColor: { bg: 'rgba(66,165,245,0.1)', c: 'var(--sky)' }, gradient: 'linear-gradient(135deg,#42a5f5,#1e88e5)', skills: ['Python', 'TensorFlow', 'AWS'], progress: 91 },
      { id: 'emily', initials: 'EH', name: 'Emily Huang', uni: 'SMU · IS Year 3', role: 'Full-Stack', roleColor: { bg: 'rgba(255,138,101,0.1)', c: 'var(--peach)' }, gradient: 'linear-gradient(135deg,#ff8a65,#ff6b6b)', skills: ['Node.js', 'React', 'PostgreSQL'], progress: 78 },
      { id: 'priya', initials: 'PS', name: 'Priya Sharma', uni: 'SMU · IS Year 2', role: 'Backend Dev', roleColor: { bg: 'rgba(179,157,219,0.1)', c: 'var(--lavender)' }, gradient: 'linear-gradient(135deg,#b39ddb,#7e57c2)', skills: ['Node.js', 'Docker', 'PostgreSQL'], progress: 82 },
    ],
    chatMessages: [
      { initials: 'JT', gradient: 'linear-gradient(135deg,var(--coral),var(--peach))', text: 'Just pushed the swipe animation update! Check the PR when you can.', self: false },
      { initials: 'WM', gradient: 'linear-gradient(135deg,var(--sky),var(--lavender))', text: 'Matching algorithm v2 is up. Accuracy went from 78% to 91%.', self: false },
      { initials: 'EH', gradient: 'linear-gradient(135deg,var(--peach),var(--coral))', text: "Amazing work both of you! I will review the PRs tonight.", self: true },
      { initials: 'PS', gradient: 'linear-gradient(135deg,var(--lavender),var(--rose))', text: 'Database is optimized. Query time down to 12ms average. Ready for demo.', self: false },
    ],
    unread: 2,
    activity: 'Updated 9m ago',
  },
  {
    id: 'beta',
    emoji: '⚡',
    name: 'Team Beta',
    status: 'Sprint Mode',
    statusColor: 'var(--honey)',
    statusBg: 'rgba(255,202,40,0.16)',
    description:
      'Building a low-latency event processing dashboard for live hackathon judging and project highlights.',
    tagline: 'Fast-moving team with demo day focus and frequent design iterations.',
    stats: [
      { val: '5', lbl: 'Members', c: 'var(--sky)' },
      { val: '2', lbl: 'Hackathons', c: 'var(--mint)' },
      { val: '4.5', lbl: 'Avg Rating', c: 'var(--honey)', prefix: '★ ' },
      { val: '1', lbl: 'Wins', c: 'var(--coral)' },
    ],
    sprint: [
      { emoji: '✅', title: 'Realtime Queue Pipeline', sub: 'Assigned to Harith · Completed', bg: 'rgba(102,187,106,0.12)' },
      { emoji: '🔄', title: 'Judge Scoring UI', sub: 'Assigned to Alicia · In Progress', bg: 'rgba(66,165,245,0.12)' },
      { emoji: '🔄', title: 'Cache Layer Tuning', sub: 'Assigned to Marcus · In Progress', bg: 'rgba(255,202,40,0.16)' },
      { emoji: '⏳', title: 'Final Smoke Tests', sub: 'Assigned to You · Pending', bg: 'rgba(255,138,101,0.12)' },
    ],
    members: [
      { id: 'harith', initials: 'HZ', name: 'Harith Zain', uni: 'SUTD · EPD Year 3', role: 'Systems Lead', roleColor: { bg: 'rgba(66,165,245,0.12)', c: 'var(--sky)' }, gradient: 'linear-gradient(135deg,#42a5f5,#26c6da)', skills: ['Go', 'Kafka', 'Redis'], progress: 88 },
      { id: 'alicia', initials: 'AL', name: 'Alicia Lim', uni: 'SMU · IS Year 2', role: 'Product Designer', roleColor: { bg: 'rgba(255,138,101,0.12)', c: 'var(--peach)' }, gradient: 'linear-gradient(135deg,#ff8a65,#ffca28)', skills: ['Figma', 'Framer', 'UX Copy'], progress: 79 },
      { id: 'marcus', initials: 'MN', name: 'Marcus Ng', uni: 'NUS · CS Year 4', role: 'Backend Dev', roleColor: { bg: 'rgba(179,157,219,0.12)', c: 'var(--lavender)' }, gradient: 'linear-gradient(135deg,#7e57c2,#42a5f5)', skills: ['Node.js', 'Prisma', 'PostgreSQL'], progress: 85 },
      { id: 'dania', initials: 'DK', name: 'Dania Kaur', uni: 'NTU · CE Year 2', role: 'Frontend Dev', roleColor: { bg: 'rgba(255,107,107,0.12)', c: 'var(--coral)' }, gradient: 'linear-gradient(135deg,#ff6b6b,#f06292)', skills: ['React', 'Charts', 'Tailwind'], progress: 74 },
      { id: 'you', initials: 'YO', name: 'You', uni: 'SMU · IS Year 2', role: 'Team Captain', roleColor: { bg: 'rgba(102,187,106,0.12)', c: 'var(--mint)' }, gradient: 'linear-gradient(135deg,#66bb6a,#26a69a)', skills: ['Planning', 'Pitching', 'QA'], progress: 81 },
    ],
    chatMessages: [
      { initials: 'HZ', gradient: 'linear-gradient(135deg,var(--sky),var(--mint))', text: 'The websocket throughput test crossed 20k msgs/min in staging.', self: false },
      { initials: 'AL', gradient: 'linear-gradient(135deg,var(--honey),var(--peach))', text: 'Uploaded revised scorecard flow. Need one more pass on accessibility.', self: false },
      { initials: 'YO', gradient: 'linear-gradient(135deg,var(--peach),var(--coral))', text: 'Looks good. Let us lock UI by tonight and start rehearsing.', self: true },
    ],
    unread: 5,
    activity: 'Updated 2m ago',
  },
  {
    id: 'gamma',
    emoji: '🧠',
    name: 'Team Gamma',
    status: 'Planning',
    statusColor: 'var(--lavender)',
    statusBg: 'rgba(179,157,219,0.16)',
    description:
      'Exploring an AI-assisted interview prep platform with adaptive mock interviews and feedback loops.',
    tagline: 'Early-stage concept validation with rapid prototype experiments.',
    stats: [
      { val: '3', lbl: 'Members', c: 'var(--lavender)' },
      { val: '1', lbl: 'Hackathons', c: 'var(--sky)' },
      { val: '4.2', lbl: 'Avg Rating', c: 'var(--honey)', prefix: '★ ' },
      { val: '0', lbl: 'Wins', c: 'var(--text-soft)' },
    ],
    sprint: [
      { emoji: '✅', title: 'Problem Statement', sub: 'Assigned to Aisyah · Completed', bg: 'rgba(102,187,106,0.12)' },
      { emoji: '🔄', title: 'Interview Prompt Engine', sub: 'Assigned to Ben · In Progress', bg: 'rgba(179,157,219,0.16)' },
      { emoji: '📝', title: 'User Research Survey', sub: 'Assigned to You · In Progress', bg: 'rgba(66,165,245,0.12)' },
    ],
    members: [
      { id: 'aisyah', initials: 'AR', name: 'Aisyah Rahman', uni: 'SMU · IS Year 1', role: 'Research Lead', roleColor: { bg: 'rgba(66,165,245,0.12)', c: 'var(--sky)' }, gradient: 'linear-gradient(135deg,#42a5f5,#5c6bc0)', skills: ['Research', 'Notion', 'Synthesis'], progress: 83 },
      { id: 'ben', initials: 'BT', name: 'Ben Teo', uni: 'NUS · CS Year 2', role: 'AI Engineer', roleColor: { bg: 'rgba(179,157,219,0.12)', c: 'var(--lavender)' }, gradient: 'linear-gradient(135deg,#7e57c2,#b39ddb)', skills: ['Python', 'LLMs', 'FastAPI'], progress: 76 },
      { id: 'you', initials: 'YO', name: 'You', uni: 'SMU · IS Year 2', role: 'Product Owner', roleColor: { bg: 'rgba(255,138,101,0.12)', c: 'var(--peach)' }, gradient: 'linear-gradient(135deg,#ff8a65,#ff6b6b)', skills: ['Roadmaps', 'Pitching', 'Validation'], progress: 69 },
    ],
    chatMessages: [
      { initials: 'AR', gradient: 'linear-gradient(135deg,var(--sky),var(--lavender))', text: 'Interviewed 8 students today. Most want confidence scoring after each answer.', self: false },
      { initials: 'BT', gradient: 'linear-gradient(135deg,var(--lavender),var(--rose))', text: 'I can prototype that with rubric-based scoring by tomorrow.', self: false },
      { initials: 'YO', gradient: 'linear-gradient(135deg,var(--peach),var(--coral))', text: 'Perfect. Let us test that with this week sample users.', self: true },
    ],
    unread: 0,
    activity: 'Updated 1h ago',
  },
];

const teamsData = rawTeamsData.map((team) => ({
  ...team,
  members: team.members.map((member) => new User(member)),
}));

export default teamsData;
