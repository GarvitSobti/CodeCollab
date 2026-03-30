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
    const author = await prisma.user.findUnique({ where: { firebaseUid: req.auth.uid } });
    if (!author) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const { targetUserId, teamId, rating, content, isAnonymous } = req.body;

    if (!targetUserId || !teamId || !['POSITIVE', 'NEGATIVE'].includes(rating) || !content) {
      return res.status(400).json({
        error: { message: 'targetUserId, teamId, rating (POSITIVE|NEGATIVE), and content are required', status: 400 },
      });
    }
    if (author.id === targetUserId) {
      return res.status(400).json({ error: { message: 'Cannot review yourself', status: 400 } });
    }

    // Verify both users were on the same team
    const [authorMember, targetMember] = await Promise.all([
      prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: author.id } } }),
      prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId: targetUserId } } }),
    ]);
    if (!authorMember || !targetMember) {
      return res.status(403).json({ error: { message: 'Both users must be members of this team', status: 403 } });
    }

    const existing = await prisma.review.findFirst({
      where: { authorId: author.id, targetUserId, teamId },
    });
    if (existing) {
      return res.status(409).json({ error: { message: 'You have already reviewed this teammate for this team', status: 409 } });
    }

    const review = await prisma.review.create({
      data: {
        authorId: author.id,
        targetUserId,
        teamId,
        rating,
        content: content.trim().slice(0, 1000),
        isAnonymous: Boolean(isAnonymous),
      },
    });

    // Recalculate target's combined score in background — does not block response
    recalcScoreForUser(targetUserId).catch((err) => {
      console.warn(`Failed to recalculate score for user ${targetUserId}:`, err.message);
    });

    return res.status(201).json({ review });
  } catch (error) {
    console.error('Failed to create review:', error);
    return res.status(500).json({ error: { message: 'Failed to create review', status: 500 } });
  }
});

// GET /api/v1/reviews/user/:userId — get reviews for a user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { targetUserId: req.params.userId },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt,
      isAnonymous: r.isAnonymous,
      author: r.isAnonymous ? null : r.author,
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
