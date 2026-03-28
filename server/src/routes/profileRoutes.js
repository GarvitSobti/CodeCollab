const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const prisma = require('../config/prisma');
const { ExperienceLevel, SkillCategory } = require('@prisma/client');

const router = express.Router();

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function toSafeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sanitizeSkills(skillsInput) {
  return toSafeArray(skillsInput)
    .map((skill) => ({
      name: normalizeString(skill?.name),
      level: Number.isFinite(Number(skill?.level)) ? Number(skill.level) : 1,
    }))
    .filter((skill) => skill.name)
    .map((skill) => ({
      ...skill,
      level: clamp(Math.round(skill.level), 1, 5),
    }));
}

function sanitizeLinks(linksInput) {
  return toSafeArray(linksInput)
    .map((link) => ({
      label: normalizeString(link?.label) || 'Project',
      url: normalizeString(link?.url),
    }))
    .filter((link) => link.url);
}

function sanitizeExperience(input) {
  return toSafeArray(input)
    .map((item) => ({
      title: normalizeString(item?.title),
      description: normalizeString(item?.description),
      url: normalizeString(item?.url),
      technologies: normalizeString(item?.technologies),
    }))
    .filter((item) => item.title);
}

function sanitizeWorkExperience(input) {
  return toSafeArray(input)
    .map((item) => ({
      company: normalizeString(item?.company),
      role: normalizeString(item?.role),
      duration: normalizeString(item?.duration),
      description: normalizeString(item?.description),
    }))
    .filter((item) => item.company || item.role);
}

function sanitizeInterests(interestsInput) {
  return toSafeArray(interestsInput)
    .map((item) => normalizeString(item))
    .filter(Boolean)
    .slice(0, 20);
}

function sanitizeAssessment(assessmentInput) {
  const assessment = toSafeObject(assessmentInput);
  const mcq = toSafeObject(assessment.mcq);
  const sliders = toSafeObject(assessment.sliders);
  const caseBased = toSafeObject(assessment.caseBased);

  return {
    mcq: {
      rolePreference: normalizeString(mcq.rolePreference),
      strongestArea: normalizeString(mcq.strongestArea),
      comfortAmbiguity: normalizeString(mcq.comfortAmbiguity),
      debuggingApproach: normalizeString(mcq.debuggingApproach),
      teamworkStyle: normalizeString(mcq.teamworkStyle),
    },
    sliders: {
      buildSpeed: clamp(Number(sliders.buildSpeed) || 1, 1, 5),
      systemDesign: clamp(Number(sliders.systemDesign) || 1, 1, 5),
      debugging: clamp(Number(sliders.debugging) || 1, 1, 5),
      collaboration: clamp(Number(sliders.collaboration) || 1, 1, 5),
      learningVelocity: clamp(Number(sliders.learningVelocity) || 1, 1, 5),
    },
    caseBased: {
      mvpTradeoff: normalizeString(caseBased.mvpTradeoff),
      prodIncident: normalizeString(caseBased.prodIncident),
    },
  };
}

function sanitizeProfilePayload(payload, authUser) {
  const personal = toSafeObject(payload?.personal);
  const social = toSafeObject(payload?.social);
  const privacy = toSafeObject(payload?.privacy);
  const verification = toSafeObject(payload?.verification);
  const hackathonExperience = toSafeObject(payload?.hackathonExperience);

  return {
    firebaseUid: authUser.uid,
    email: authUser.email || null,
    personal: {
      name: normalizeString(personal.name) || authUser.name || authUser.email || '',
      university: normalizeString(personal.university),
      year: normalizeString(personal.year),
      major: normalizeString(personal.major),
    },
    bio: normalizeString(payload?.bio),
    interests: sanitizeInterests(payload?.interests),
    skills: sanitizeSkills(payload?.skills),
    assessment: sanitizeAssessment(payload?.assessment),
    hackathonExperience: {
      count: clamp(Number(hackathonExperience.count) || 0, 0, 100),
      summary: normalizeString(hackathonExperience.summary),
    },
    portfolioLinks: sanitizeLinks(payload?.portfolioLinks),
    projectExperience: sanitizeExperience(payload?.projectExperience),
    workExperience: sanitizeWorkExperience(payload?.workExperience),
    social: {
      github: normalizeString(social.github),
      linkedin: normalizeString(social.linkedin),
    },
    photoDataUrl: normalizeString(payload?.photoDataUrl),
    privacy: {
      showEmail: Boolean(privacy.showEmail),
      showPortfolio: privacy.showPortfolio !== false,
      discoverable: privacy.discoverable !== false,
    },
    verification: {
      githubVerified: Boolean(verification.githubVerified),
      linkedinVerified: Boolean(verification.linkedinVerified),
      universityVerified: Boolean(verification.universityVerified),
    },
    onboardingCompleted: Boolean(payload?.onboardingCompleted),
  };
}

function computeCompletion(profile) {
  const assessment = profile.assessment || sanitizeAssessment({});
  const checks = [
    Boolean(profile.personal.name),
    Boolean(profile.personal.university),
    Boolean(profile.personal.year),
    Boolean(profile.personal.major),
    profile.skills.length > 0,
    profile.hackathonExperience.count > 0 || Boolean(profile.hackathonExperience.summary),
    Boolean(assessment.mcq.rolePreference),
    Boolean(assessment.mcq.strongestArea),
    Boolean(assessment.mcq.comfortAmbiguity),
    Boolean(assessment.mcq.debuggingApproach),
    Boolean(assessment.mcq.teamworkStyle),
    Boolean(assessment.caseBased.mvpTradeoff),
    Boolean(assessment.caseBased.prodIncident),
    Boolean(profile.social.github),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function scoreFromMcq(mcq) {
  const scoringMap = {
    rolePreference: {
      frontend: 10,
      backend: 12,
      fullstack: 14,
      ai: 13,
      product: 9,
    },
    strongestArea: {
      ui: 8,
      api: 11,
      data: 12,
      ml: 12,
      devops: 13,
      unknown: 5,
    },
    comfortAmbiguity: {
      low: 4,
      medium: 8,
      high: 12,
    },
    debuggingApproach: {
      guess: 3,
      logs: 8,
      isolate: 12,
      hypothesis: 14,
    },
    teamworkStyle: {
      follow: 6,
      contributor: 9,
      coordinator: 12,
      lead: 13,
    },
  };

  return (
    (scoringMap.rolePreference[mcq.rolePreference] || 0) +
    (scoringMap.strongestArea[mcq.strongestArea] || 0) +
    (scoringMap.comfortAmbiguity[mcq.comfortAmbiguity] || 0) +
    (scoringMap.debuggingApproach[mcq.debuggingApproach] || 0) +
    (scoringMap.teamworkStyle[mcq.teamworkStyle] || 0)
  );
}

function scoreFromCaseResponses(caseBased) {
  const caseScoreMap = {
    mvpTradeoff: {
      build_fast_ignore_risk: 4,
      define_scope_and_milestones: 13,
      overengineer: 6,
      wait_for_perfect_plan: 5,
    },
    prodIncident: {
      rollback_and_triage: 13,
      patch_without_rootcause: 6,
      wait_for_someone_else: 4,
      random_trial_error: 5,
    },
  };

  return (
    (caseScoreMap.mvpTradeoff[caseBased.mvpTradeoff] || 0) +
    (caseScoreMap.prodIncident[caseBased.prodIncident] || 0)
  );
}

function computeSkillScore(profile) {
  const assessment = profile.assessment || sanitizeAssessment({});

  const levels = profile.skills.map((skill) => skill.level);
  const avgSkillLevel = levels.length
    ? levels.reduce((sum, level) => sum + level, 0) / levels.length
    : 1;

  const sliderAvg = (
    assessment.sliders.buildSpeed +
    assessment.sliders.systemDesign +
    assessment.sliders.debugging +
    assessment.sliders.collaboration +
    assessment.sliders.learningVelocity
  ) / 5;

  const skillBase = ((avgSkillLevel - 1) / 4) * 22;
  const sliderBase = ((sliderAvg - 1) / 4) * 24;
  const mcqScore = scoreFromMcq(assessment.mcq);
  const caseScore = scoreFromCaseResponses(assessment.caseBased);
  const hackathonBonus = Math.min(profile.hackathonExperience.count * 1.2, 10);
  const githubBonus = profile.social.github ? 6 : 0;
  const portfolioBonus = Math.min(profile.portfolioLinks.length * 2, 6);
  const verificationBonus =
    (profile.verification.githubVerified ? 2 : 0) +
    (profile.verification.linkedinVerified ? 1 : 0) +
    (profile.verification.universityVerified ? 2 : 0);

  const total = Math.round(
    skillBase +
    sliderBase +
    mcqScore * 0.45 +
    caseScore * 0.55 +
    hackathonBonus +
    githubBonus +
    portfolioBonus +
    verificationBonus
  );

  return clamp(total, 0, 100);
}

function scoreToTier(score) {
  if (score < 40) return ExperienceLevel.BEGINNER;
  if (score < 70) return ExperienceLevel.INTERMEDIATE;
  return ExperienceLevel.ADVANCED;
}

function tierToLabel(tier) {
  if (tier === ExperienceLevel.ADVANCED) return 'Advanced';
  if (tier === ExperienceLevel.INTERMEDIATE) return 'Intermediate';
  return 'Beginner';
}

function safeJsonArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

function toClientProfile(user, profile) {
  const skillsFromJson = safeJsonArray(profile?.skills, []);
  const assessment = sanitizeAssessment(profile?.assessmentResponses || {});

  return {
    firebaseUid: user.firebaseUid,
    email: user.email,
    personal: {
      name: user.name || '',
      university: user.university || '',
      year: profile?.academicYear || '',
      major: profile?.major || '',
    },
    bio: user.bio || '',
    interests: safeJsonArray(profile?.interests, []),
    skills: skillsFromJson,
    assessment,
    hackathonExperience: {
      count: profile?.hackathonExperienceCount || 0,
      summary: profile?.hackathonExperienceNotes || '',
    },
    portfolioLinks: safeJsonArray(profile?.portfolioLinks, []),
    projectExperience: safeJsonArray(profile?.projectExperience, []),
    workExperience: safeJsonArray(profile?.workExperience, []),
    social: {
      github: user.githubUrl || '',
      linkedin: user.linkedinUrl || '',
    },
    photoDataUrl: profile?.photoDataUrl || '',
    privacy: {
      showEmail: Boolean(profile?.showEmail),
      showPortfolio: profile?.showPortfolio !== false,
      discoverable: profile?.discoverable !== false,
    },
    verification: {
      githubVerified: Boolean(profile?.githubVerified),
      linkedinVerified: Boolean(profile?.linkedinVerified),
      universityVerified: Boolean(profile?.universityVerified),
    },
    onboardingCompleted: Boolean(profile?.onboardingCompleted),
    completion: profile?.completion || 0,
    skillScore: profile?.internalSkillScore || 0,
    skillTier: tierToLabel(profile?.internalSkillTier),
    createdAt: profile?.createdAt,
    updatedAt: profile?.updatedAt,
  };
}

async function getOrCreateUserWithProfile(authUser) {
  const nameFallback = authUser.name || authUser.email || 'CodeCollab User';
  const emailFallback = authUser.email || `${authUser.uid}@codecollab.local`;

  let user = await prisma.user.findUnique({
    where: { firebaseUid: authUser.uid },
    include: { profile: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        firebaseUid: authUser.uid,
        email: emailFallback,
        name: nameFallback,
        avatarUrl: authUser.picture || null,
        profile: {
          create: {},
        },
      },
      include: { profile: true },
    });
  }

  if (!user.profile) {
    await prisma.userProfile.create({ data: { userId: user.id } });
    user = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });
  }

  return user;
}

async function syncUserSkills(userId, skills) {
  await prisma.userSkill.deleteMany({ where: { userId } });

  if (!skills.length) return;

  const skillRecords = await Promise.all(
    skills.map((skill) => prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: {
        name: skill.name,
        category: SkillCategory.OTHER,
      },
    }))
  );

  await prisma.userSkill.createMany({
    data: skillRecords.map((record, index) => ({
      userId,
      skillId: record.id,
      proficiencyLevel: skills[index].level,
    })),
    skipDuplicates: true,
  });
}

router.get('/me', authMiddleware, async (req, res) => {
  const authUser = req.auth;
  const user = await getOrCreateUserWithProfile(authUser);
  return res.status(200).json({ profile: toClientProfile(user, user.profile) });
});

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const authUser = req.auth;
    const incoming = sanitizeProfilePayload(req.body, authUser);
    const completion = computeCompletion(incoming);
    const internalSkillScore = computeSkillScore(incoming);
    const internalSkillTier = scoreToTier(internalSkillScore);

    const user = await getOrCreateUserWithProfile(authUser);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: incoming.email || user.email,
        name: incoming.personal.name || user.name,
        avatarUrl: incoming.photoDataUrl || user.avatarUrl,
        bio: incoming.bio || null,
        university: incoming.personal.university || null,
        githubUrl: incoming.social.github || null,
        linkedinUrl: incoming.social.linkedin || null,
      },
    });

    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        academicYear: incoming.personal.year || null,
        major: incoming.personal.major || null,
        interests: incoming.interests,
        skills: incoming.skills,
        assessmentResponses: incoming.assessment,
        hackathonExperienceCount: incoming.hackathonExperience.count,
        hackathonExperienceNotes: incoming.hackathonExperience.summary || null,
        portfolioLinks: incoming.portfolioLinks,
        projectExperience: incoming.projectExperience,
        workExperience: incoming.workExperience,
        photoDataUrl: incoming.photoDataUrl || null,
        showEmail: incoming.privacy.showEmail,
        showPortfolio: incoming.privacy.showPortfolio,
        discoverable: incoming.privacy.discoverable,
        githubVerified: incoming.verification.githubVerified,
        linkedinVerified: incoming.verification.linkedinVerified,
        universityVerified: incoming.verification.universityVerified,
        onboardingCompleted: incoming.onboardingCompleted || completion >= 70,
        completion,
        internalSkillScore,
        internalSkillTier,
      },
      create: {
        userId: user.id,
        academicYear: incoming.personal.year || null,
        major: incoming.personal.major || null,
        interests: incoming.interests,
        skills: incoming.skills,
        assessmentResponses: incoming.assessment,
        hackathonExperienceCount: incoming.hackathonExperience.count,
        hackathonExperienceNotes: incoming.hackathonExperience.summary || null,
        portfolioLinks: incoming.portfolioLinks,
        projectExperience: incoming.projectExperience,
        workExperience: incoming.workExperience,
        photoDataUrl: incoming.photoDataUrl || null,
        showEmail: incoming.privacy.showEmail,
        showPortfolio: incoming.privacy.showPortfolio,
        discoverable: incoming.privacy.discoverable,
        githubVerified: incoming.verification.githubVerified,
        linkedinVerified: incoming.verification.linkedinVerified,
        universityVerified: incoming.verification.universityVerified,
        onboardingCompleted: incoming.onboardingCompleted || completion >= 70,
        completion,
        internalSkillScore,
        internalSkillTier,
      },
    });

    await syncUserSkills(user.id, incoming.skills);

    const refreshed = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: toClientProfile(refreshed, refreshed.profile),
    });
  } catch (error) {
    console.error('Failed to update profile via Prisma:', error);
    return res.status(500).json({
      error: {
        message: 'Failed to update profile',
        status: 500,
      },
    });
  }
});

module.exports = router;
