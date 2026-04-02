const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/authMiddleware');
const {
  scoreToTier,
  scoreFromMcq,
  scoreFromCaseResponses,
  clamp,
  computeCombinedScore,
} = require('../services/scoringService');

const router = express.Router();

async function resolveCurrentUser(firebaseUid) {
  return prisma.user.findUnique({ where: { firebaseUid } });
}

async function getSharedTeams(authorId, targetUserId) {
  const sharedMemberships = await prisma.teamMember.findMany({
    where: {
      userId: authorId,
      team: {
        members: {
          some: { userId: targetUserId },
        },
      },
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          hackathon: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return sharedMemberships.map(({ team }) => team);
}

async function resolveReviewContext(authorId, targetUserId) {
  const sharedTeams = await getSharedTeams(authorId, targetUserId);
  const sharedTeamIds = sharedTeams.map((team) => team.id);

  const existingReviews = sharedTeamIds.length
    ? await prisma.review.findMany({
        where: {
          authorId,
          targetUserId,
          teamId: { in: sharedTeamIds },
        },
        select: {
          id: true,
          teamId: true,
          rating: true,
          createdAt: true,
        },
      })
    : [];

  return {
    sharedTeams,
    existingReviews,
  };
}

async function recalcScoreForUser(userId) {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });
  if (!profile) return;

  const assessment = profile.assessmentResponses || {};
  const mcq       = assessment.mcq       || {};
  const sliders   = assessment.sliders   || {};
  const caseBased = assessment.caseBased || {};
  const skills    = Array.isArray(profile.skills) ? profile.skills : [];

  const avgSkillLevel = skills.length
    ? skills.reduce((s, sk) => s + (sk.level || 1), 0) / skills.length
    : 1;
  const sliderAvg = ['buildSpeed', 'systemDesign', 'debugging', 'collaboration', 'learningVelocity']
    .reduce((s, k) => s + (Number(sliders[k]) || 1), 0) / 5;

  const mcqRaw  = scoreFromMcq(mcq);
  const caseRaw = scoreFromCaseResponses(caseBased);

  const selfScore = clamp(Math.round(
    ((avgSkillLevel - 1) / 4) * 25 +
    ((sliderAvg    - 1) / 4) * 25 +
    (mcqRaw  / 56) * 25 +
    (caseRaw / 26) * 25,
  ), 0, 100);

  const finalScore = await computeCombinedScore(userId, selfScore, profile.githubScore ?? 0);

  await prisma.userProfile.update({
    where: { userId },
    data: { internalSkillScore: finalScore, internalSkillTier: scoreToTier(finalScore) },
  });
}

// POST /api/v1/reviews — submit a review for a teammate
router.post('/', authMiddleware, async (req, res) => {
  try {
    const author = await resolveCurrentUser(req.auth.uid);
    if (!author) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const { targetUserId, teamId, rating, content, isAnonymous } = req.body;
    const trimmedContent = typeof content === 'string' ? content.trim() : '';

    if (!targetUserId || !['POSITIVE', 'NEGATIVE'].includes(rating) || !trimmedContent) {
      return res.status(400).json({
        error: { message: 'targetUserId, rating (POSITIVE|NEGATIVE), and content are required', status: 400 },
      });
    }
    if (author.id === targetUserId) {
      return res.status(400).json({ error: { message: 'Cannot review yourself', status: 400 } });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } });
    if (!targetUser) {
      return res.status(404).json({ error: { message: 'Target user not found', status: 404 } });
    }

    const { sharedTeams } = await resolveReviewContext(author.id, targetUserId);
    if (!sharedTeams.length) {
      return res.status(403).json({ error: { message: 'You can only review teammates you have worked with', status: 403 } });
    }

    let resolvedTeamId = teamId;

    if (!resolvedTeamId) {
      if (sharedTeams.length === 1) {
        resolvedTeamId = sharedTeams[0].id;
      } else {
        return res.status(400).json({
          error: {
            message: 'teamId is required when you share multiple teams with this user',
            status: 400,
          },
        });
      }
    }

    const selectedTeam = sharedTeams.find((team) => team.id === resolvedTeamId);
    if (!selectedTeam) {
      return res.status(403).json({ error: { message: 'You can only review users from a shared team', status: 403 } });
    }

    const existing = await prisma.review.findFirst({
      where: { authorId: author.id, targetUserId, teamId: resolvedTeamId },
    });
    if (existing) {
      return res.status(409).json({ error: { message: 'You have already reviewed this teammate for this team', status: 409 } });
    }

    const review = await prisma.review.create({
      data: {
        authorId: author.id,
        targetUserId,
        teamId: resolvedTeamId,
        rating,
        content: trimmedContent.slice(0, 1000),
        isAnonymous: Boolean(isAnonymous),
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            hackathon: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Recalculate target's combined score in background — does not block response
    recalcScoreForUser(targetUserId).catch((err) => {
      console.warn(`Failed to recalculate score for user ${targetUserId}:`, err.message);
    });

    return res.status(201).json({
      review: {
        id: review.id,
        targetUserId: review.targetUserId,
        rating: review.rating,
        content: review.content,
        isAnonymous: review.isAnonymous,
        createdAt: review.createdAt,
        team: review.team,
      },
    });
  } catch (error) {
    console.error('Failed to create review:', error);
    return res.status(500).json({ error: { message: 'Failed to create review', status: 500 } });
  }
});

router.get('/eligibility/:targetUserId', authMiddleware, async (req, res) => {
  try {
    const author = await resolveCurrentUser(req.auth.uid);
    if (!author) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const targetUserId = req.params.targetUserId;
    if (author.id === targetUserId) {
      return res.json({
        canReview: false,
        reason: 'Cannot review yourself',
        sharedTeams: [],
        existingReviews: [],
      });
    }

    const { sharedTeams, existingReviews } = await resolveReviewContext(author.id, targetUserId);
    const reviewedTeamIds = new Set(existingReviews.map((review) => review.teamId));
    const availableTeams = sharedTeams.filter((team) => !reviewedTeamIds.has(team.id));

    return res.json({
      canReview: availableTeams.length > 0,
      reason: sharedTeams.length === 0
        ? 'You can only review teammates you have worked with'
        : availableTeams.length === 0
          ? 'You have already reviewed this user for every shared team'
          : null,
      sharedTeams: sharedTeams.map((team) => ({
        id: team.id,
        name: team.name,
        hackathon: team.hackathon,
        alreadyReviewed: reviewedTeamIds.has(team.id),
      })),
      existingReviews,
    });
  } catch (error) {
    console.error('Failed to check review eligibility:', error);
    return res.status(500).json({ error: { message: 'Failed to load review eligibility', status: 500 } });
  }
});

// GET /api/v1/reviews/user/:userId — get reviews for a user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { targetUserId: req.params.userId },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        team: {
          select: {
            id: true,
            name: true,
            hackathon: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt,
      isAnonymous: r.isAnonymous,
      author: r.isAnonymous ? null : r.author,
      team: r.team,
    }));

    return res.json({
      reviews: formatted,
      positiveCount: reviews.filter((r) => r.rating === 'POSITIVE').length,
      negativeCount: reviews.filter((r) => r.rating === 'NEGATIVE').length,
      total: reviews.length,
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch reviews', status: 500 } });
  }
});

module.exports = router;
