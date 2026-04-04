const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/authMiddleware');
const { ExperienceLevel } = require('@prisma/client');
const { normalizePair } = require('../utils/matchUtils');

const router = express.Router();

// Full user+profile fetch — used by GET /discover
async function resolveUserWithProfile(uid) {
  return prisma.user.findUnique({ where: { firebaseUid: uid }, include: { profile: true } });
}

// Lightweight fetch — used by POST /swipe
async function resolveUserBasic(uid) {
  return prisma.user.findUnique({ where: { firebaseUid: uid }, select: { id: true, firebaseUid: true, name: true } });
}

// Maps tier enum to a numeric rank for proximity math
function tierRank(tier) {
  if (tier === ExperienceLevel.ADVANCED) return 2;
  if (tier === ExperienceLevel.INTERMEDIATE) return 1;
  return 0;
}

// Extracts a flat set of lowercase skill names from a profile's skills JSON
function skillNames(profile) {
  if (!Array.isArray(profile?.skills)) return new Set();
  return new Set(profile.skills.map((s) => String(s?.name || '').toLowerCase()).filter(Boolean));
}

/**
 * Compatibility score (0–100) between the current user and a candidate.
 *
 * Tier proximity         40 pts — same tier = 40, one apart = 20, two apart = 0
 * Skill complement       25 pts — candidate has skills the current user doesn't (fills gaps)
 * Experience match       15 pts — closeness of hackathon count
 * Shared hackathon interest 20 pts — both expressed interest in the same hackathons
 */
function compatibilityScore(myProfile, candidateProfile, sharedHackathonCount = 0) {
  // ── Tier proximity (0–40) ─────────────────────────────────────────────────
  const myTier  = tierRank(myProfile?.internalSkillTier);
  const canTier = tierRank(candidateProfile?.internalSkillTier);
  const tierDiff = Math.abs(myTier - canTier);
  const tierScore = tierDiff === 0 ? 40 : tierDiff === 1 ? 20 : 0;

  // ── Skill complementarity (0–25) ─────────────────────────────────────────
  // Count skills the candidate has that the current user doesn't
  const mySkills  = skillNames(myProfile);
  const canSkills = skillNames(candidateProfile);
  const newSkills = [...canSkills].filter((s) => !mySkills.has(s)).length;
  // More gaps filled = better, cap at 5 skills → 25 pts
  const complementScore = Math.min(newSkills / 5, 1) * 25;

  // ── Experience proximity (0–15) ───────────────────────────────────────────
  const myHack  = myProfile?.hackathonExperienceCount ?? 0;
  const canHack = candidateProfile?.hackathonExperienceCount ?? 0;
  const hackDiff = Math.abs(myHack - canHack);
  // Within 2 hackathons = full score; ≥6 apart = 0
  const expScore = Math.max(0, (1 - hackDiff / 6)) * 15;

  // ── Shared hackathon interest (0–20) ──────────────────────────────────────
  // 1 shared hackathon = 10 pts, 2+ = full 20 pts
  const interestScore = Math.min(sharedHackathonCount / 2, 1) * 20;

  return Math.round(tierScore + complementScore + expScore + interestScore);
}

// GET /api/v1/discover — ranked candidate profiles for swiping
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUserWithProfile(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const existingSwipes = await prisma.swipe.findMany({
      where: { swiperId: user.id },
      select: { targetId: true },
    }).catch(() => []);

    const swipedIds = new Set(existingSwipes.map((s) => s.targetId));
    swipedIds.add(user.id);

    // Fetch the current user's hackathon interests
    const myInterests = await prisma.hackathonInterest.findMany({
      where: { userId: user.id },
      select: { hackathonId: true },
    });
    const myHackathonIds = new Set(myInterests.map((i) => i.hackathonId));

    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: [...swipedIds] },
        profile: { onboardingCompleted: true, discoverable: true },
      },
      include: {
        profile: {
          select: {
            skills: true,
            major: true,
            interests: true,
            academicYear: true,
            photoDataUrl: true,
            hackathonExperienceCount: true,
            hackathonExperienceNotes: true,
            projectExperience: true,
            workExperience: true,
            internalSkillTier: true,
            internalSkillScore: true,
          },
        },
        hackathonInterests: {
          select: { hackathonId: true },
        },
      },
      take: 100, // fetch more than needed so ranking is meaningful
    });

    // Rank by compatibility against the current user's profile
    const myProfile = user.profile;
    const ranked = candidates
      .map((c) => {
        const sharedCount = c.hackathonInterests.filter((i) => myHackathonIds.has(i.hackathonId)).length;
        return { candidate: c, score: compatibilityScore(myProfile, c.profile, sharedCount) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    const profiles = ranked.map(({ candidate: c, score }) => ({
      id: c.id,
      firebaseUid: c.firebaseUid,
      name: c.name,
      avatarUrl: c.avatarUrl,
      university: c.university,
      bio: c.bio,
      compatibilityScore: score,
      profile: c.profile,
    }));

    return res.json({ profiles });
  } catch (error) {
    console.error('Failed to fetch discover profiles:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch profiles', status: 500 } });
  }
});

// GET /api/v1/discover/users — browse all users with search
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUserBasic(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const { search, page = 1, limit = 24, filter } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const takeNum = Math.min(parseInt(limit) || 24, 50);
    const skip = (pageNum - 1) * takeNum;

    const where = {
      profile: { onboardingCompleted: true, discoverable: true },
    };

    // Apply relationship filters
    if (filter === 'teammates') {
      const memberships = await prisma.teamMember.findMany({
        where: { userId: user.id },
        select: { teamId: true },
      });
      const teamIds = memberships.map((m) => m.teamId);
      const teammates = await prisma.teamMember.findMany({
        where: { teamId: { in: teamIds }, userId: { not: user.id } },
        select: { userId: true },
      });
      const teammateIds = [...new Set(teammates.map((t) => t.userId))];
      where.id = { in: teammateIds };
    } else if (filter === 'matches') {
      const matches = await prisma.match.findMany({
        where: {
          OR: [{ userOneId: user.firebaseUid }, { userTwoId: user.firebaseUid }],
        },
        select: { userOneId: true, userTwoId: true },
      });
      const matchedFirebaseUids = matches.map((m) =>
        m.userOneId === user.firebaseUid ? m.userTwoId : m.userOneId
      );
      where.firebaseUid = { in: matchedFirebaseUids };
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { university: { contains: term, mode: 'insensitive' } },
        { bio: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: {
            select: {
              skills: true,
              major: true,
              interests: true,
              academicYear: true,
              photoDataUrl: true,
              hackathonExperienceCount: true,
              internalSkillTier: true,
              internalSkillScore: true,
            },
          },
        },
        skip,
        take: takeNum,
        orderBy: { name: 'asc' },
      }),
      prisma.user.count({ where }),
    ]);

    const profiles = users.map((u) => ({
      id: u.id,
      firebaseUid: u.firebaseUid,
      name: u.name,
      avatarUrl: u.avatarUrl,
      university: u.university,
      bio: u.bio,
      profile: u.profile,
    }));

    return res.json({
      currentUserId: user.id,
      users: profiles,
      pagination: { page: pageNum, limit: takeNum, total, totalPages: Math.ceil(total / takeNum) },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch users', status: 500 } });
  }
});

// POST /api/v1/discover/swipe — record a swipe (left or right)
router.post('/swipe', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUserBasic(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const { targetId, direction } = req.body;
    if (!targetId || !['left', 'right'].includes(direction)) {
      return res.status(400).json({ error: { message: 'targetId and direction (left/right) required', status: 400 } });
    }

    const target = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true, firebaseUid: true } });
    if (!target) return res.status(404).json({ error: { message: 'Target user not found', status: 404 } });

    await prisma.swipe.upsert({
      where: { swiperId_targetId: { swiperId: user.id, targetId: target.id } },
      update: { direction },
      create: { swiperId: user.id, targetId: target.id, direction },
    });

    let matched = false;

    if (direction === 'right') {
      const reciprocal = await prisma.swipe.findUnique({
        where: { swiperId_targetId: { swiperId: target.id, targetId: user.id } },
      });

      if (reciprocal?.direction === 'right') {
        const [userOneId, userTwoId] = normalizePair(user.firebaseUid, target.firebaseUid);
        const existing = await prisma.match.findUnique({
          where: { userOneId_userTwoId: { userOneId, userTwoId } },
        });
        await prisma.match.upsert({
          where: { userOneId_userTwoId: { userOneId, userTwoId } },
          update: {},
          create: { userOneId, userTwoId, status: 'accepted', createdByUserId: user.firebaseUid },
        });
        // Notify the first swiper (target) — they already moved on and won't see the modal
        if (!existing) {
          prisma.notification.create({
            data: {
              userId: target.id,
              type: 'NEW_MATCH',
              title: "It's a Match!",
              content: `You and ${user.name} both want to collaborate. Go to Matches to message them!`,
              relatedId: user.firebaseUid,
              relatedType: 'user',
            },
          }).catch((e) => console.warn('[match notify]', e.message));
        }
        matched = true;
      }
    }

    return res.json({ matched, direction });
  } catch (error) {
    console.error('Failed to record swipe:', error);
    return res.status(500).json({ error: { message: 'Failed to record swipe', status: 500 } });
  }
});

// GET /api/v1/discover/matches — all mutual matches for current user
router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUserBasic(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ userOneId: user.firebaseUid }, { userTwoId: user.firebaseUid }],
        status: 'accepted',
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = await Promise.all(matches.map(async (match) => {
      const otherUid = match.userOneId === user.firebaseUid ? match.userTwoId : match.userOneId;
      // Skip demo seed users
      if (otherUid.startsWith('seed-')) return null;
      const other = await prisma.user.findUnique({
        where: { firebaseUid: otherUid },
        include: { profile: true },
      });
      if (!other) return null;
      return {
        matchId: match.id,
        matchedAt: match.createdAt,
        user: {
          id: other.id,
          firebaseUid: other.firebaseUid,
          name: other.name,
          avatarUrl: other.avatarUrl,
          university: other.university,
          bio: other.bio,
          profile: other.profile,
        },
      };
    }));

    return res.json({ matches: result.filter(Boolean) });
  } catch (error) {
    console.error('Failed to fetch matches:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch matches', status: 500 } });
  }
});

// GET /api/v1/discover/relationship/:targetId — check match/team relationship
router.get('/relationship/:targetId', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUserBasic(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const targetId = req.params.targetId;
    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, firebaseUid: true },
    });
    if (!target) return res.status(404).json({ error: { message: 'Target user not found', status: 404 } });

    const [userOneId, userTwoId] = normalizePair(user.firebaseUid, target.firebaseUid);
    const match = await prisma.match.findFirst({
      where: { userOneId, userTwoId, status: 'accepted' },
    });

    const sharedTeam = await prisma.teamMember.findFirst({
      where: {
        userId: user.id,
        team: { members: { some: { userId: target.id } } },
      },
    });

    return res.json({ matched: Boolean(match), onSameTeam: Boolean(sharedTeam) });
  } catch (error) {
    console.error('Failed to check relationship:', error);
    return res.status(500).json({ error: { message: 'Failed to check relationship', status: 500 } });
  }
});

module.exports = router;
