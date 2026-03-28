const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/authMiddleware');
const { Match } = require('../models');
const { normalizePair } = require('../services/chatSeedService');

const router = express.Router();

async function resolveUser(uid) {
  return prisma.user.findUnique({ where: { firebaseUid: uid } });
}

// GET /api/v1/discover — get candidate profiles for swiping
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUser(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    // Get IDs the user has already swiped on (both directions)
    const existingSwipes = await prisma.swipe.findMany({
      where: { swiperId: user.id },
      select: { targetId: true },
    }).catch(() => []);

    const swipedIds = new Set(existingSwipes.map((s) => s.targetId));
    swipedIds.add(user.id); // exclude self

    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: [...swipedIds] },
        profile: {
          onboardingCompleted: true,
          discoverable: true,
        },
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
          },
        },
      },
      take: 20,
    });

    const profiles = candidates.map((c) => ({
      id: c.id,
      firebaseUid: c.firebaseUid,
      name: c.name,
      email: c.email,
      avatarUrl: c.avatarUrl,
      university: c.university,
      graduationYear: c.graduationYear,
      bio: c.bio,
      profile: c.profile,
    }));

    return res.json({ profiles });
  } catch (error) {
    console.error('Failed to fetch discover profiles:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch profiles', status: 500 } });
  }
});

// POST /api/v1/discover/swipe — record a swipe (left or right)
router.post('/swipe', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUser(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const { targetId, direction } = req.body;
    if (!targetId || !['left', 'right'].includes(direction)) {
      return res.status(400).json({ error: { message: 'targetId and direction (left/right) required', status: 400 } });
    }

    const target = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true, firebaseUid: true } });
    if (!target) return res.status(404).json({ error: { message: 'Target user not found', status: 404 } });

    // Record swipe (upsert to avoid duplicates)
    await prisma.swipe.upsert({
      where: { swiperId_targetId: { swiperId: user.id, targetId: target.id } },
      update: { direction },
      create: { swiperId: user.id, targetId: target.id, direction },
    });

    let matched = false;

    if (direction === 'right') {
      // Check if the other user also swiped right on us
      const reciprocal = await prisma.swipe.findUnique({
        where: { swiperId_targetId: { swiperId: target.id, targetId: user.id } },
      });

      if (reciprocal && reciprocal.direction === 'right') {
        // Mutual match — create a match record in the Sequelize matches table for chat
        const [userOneId, userTwoId] = normalizePair(user.firebaseUid, target.firebaseUid);
        await Match.findOrCreate({
          where: { userOneId, userTwoId },
          defaults: {
            userOneId,
            userTwoId,
            status: 'accepted',
            createdByUserId: user.firebaseUid,
          },
        });
        matched = true;
      }
    }

    return res.json({ matched, direction });
  } catch (error) {
    console.error('Failed to record swipe:', error);
    return res.status(500).json({ error: { message: 'Failed to record swipe', status: 500 } });
  }
});

module.exports = router;
