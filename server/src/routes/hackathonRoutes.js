const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/v1/hackathons — public listing
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const hackathons = await prisma.hackathon.findMany({
      orderBy: { startDate: 'asc' },
      include: {
        _count: { select: { interests: true } },
      },
    });

    const data = hackathons.map((h) => {
      let status;
      if (now >= h.startDate && now <= h.endDate) {
        status = 'LIVE';
      } else if (h.registrationDeadline && now <= h.registrationDeadline) {
        status = 'OPEN';
      } else if (now < h.startDate) {
        status = 'SOON';
      } else {
        status = 'ENDED';
      }

      return {
        id: h.id,
        name: h.name,
        description: h.description,
        url: h.url,
        imageUrl: h.imageUrl,
        startDate: h.startDate,
        endDate: h.endDate,
        registrationDeadline: h.registrationDeadline,
        location: h.location,
        isOnline: h.isOnline,
        minTeamSize: h.minTeamSize,
        maxTeamSize: h.maxTeamSize,
        difficultyLevel: h.difficultyLevel,
        tags: h.tags,
        status,
        interestedCount: h._count.interests,
      };
    });

    return res.json({ hackathons: data });
  } catch (error) {
    console.error('Failed to fetch hackathons:', error);
    return res.status(500).json({
      error: { message: 'Failed to fetch hackathons', status: 500 },
    });
  }
});

// GET /api/v1/hackathons/me/interests — get current user's registered hackathons
// (must be before /:id to avoid "me" being treated as an id)
router.get('/me/interests', authMiddleware, async (req, res) => {
  try {
    const { uid } = req.auth;

    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
      select: { id: true },
    });

    if (!user) {
      return res.status(401).json({
        error: { message: 'User not found', status: 401 },
      });
    }

    const interests = await prisma.hackathonInterest.findMany({
      where: { userId: user.id },
      select: { hackathonId: true },
    });

    return res.json({
      hackathonIds: interests.map((i) => i.hackathonId),
    });
  } catch (error) {
    console.error('Failed to fetch user interests:', error);
    return res.status(500).json({
      error: { message: 'Failed to fetch interests', status: 500 },
    });
  }
});

// GET /api/v1/hackathons/:id — single hackathon detail
router.get('/:id', async (req, res) => {
  try {
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { interests: true, teams: true } },
      },
    });

    if (!hackathon) {
      return res.status(404).json({
        error: { message: 'Hackathon not found', status: 404 },
      });
    }

    return res.json({ hackathon });
  } catch (error) {
    console.error('Failed to fetch hackathon:', error);
    return res.status(500).json({
      error: { message: 'Failed to fetch hackathon', status: 500 },
    });
  }
});

// POST /api/v1/hackathons/:id/interest — toggle interest (register/unregister)
router.post('/:id/interest', authMiddleware, async (req, res) => {
  try {
    const { uid } = req.auth;

    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
      select: { id: true },
    });

    if (!user) {
      return res.status(401).json({
        error: { message: 'User not found', status: 401 },
      });
    }

    const hackathon = await prisma.hackathon.findUnique({
      where: { id: req.params.id },
      select: { id: true },
    });

    if (!hackathon) {
      return res.status(404).json({
        error: { message: 'Hackathon not found', status: 404 },
      });
    }

    const existing = await prisma.hackathonInterest.findUnique({
      where: {
        userId_hackathonId: {
          userId: user.id,
          hackathonId: hackathon.id,
        },
      },
    });

    if (existing) {
      await prisma.hackathonInterest.delete({
        where: {
          userId_hackathonId: {
            userId: user.id,
            hackathonId: hackathon.id,
          },
        },
      });
      return res.json({ registered: false });
    }

    await prisma.hackathonInterest.create({
      data: {
        userId: user.id,
        hackathonId: hackathon.id,
      },
    });

    return res.json({ registered: true });
  } catch (error) {
    console.error('Failed to toggle hackathon interest:', error);
    return res.status(500).json({
      error: { message: 'Failed to update interest', status: 500 },
    });
  }
});

module.exports = router;
