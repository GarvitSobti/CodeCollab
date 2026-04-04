const express = require('express');
const prisma = require('../config/prisma');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Helper: resolve Prisma user from Firebase UID
async function resolveUser(uid) {
  return prisma.user.findUnique({ where: { firebaseUid: uid } });
}

// GET /api/v1/teams — list teams the current user belongs to
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUser(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const memberships = await prisma.teamMember.findMany({
      where: { userId: user.id },
      include: {
        team: {
          include: {
            hackathon: { select: { id: true, name: true, startDate: true, endDate: true } },
            members: {
              include: {
                user: {
                  select: {
                    id: true, firebaseUid: true, name: true, email: true, avatarUrl: true, university: true, graduationYear: true,
                    profile: { select: { photoDataUrl: true, skills: true, major: true } },
                  },
                },
              },
            },
            _count: { select: { members: true } },
          },
        },
      },
    });

    const teams = memberships.map((m) => ({
      ...m.team,
      myRole: m.role,
    }));

    return res.json({ teams });
  } catch (error) {
    console.error('Failed to list teams:', error);
    return res.status(500).json({ error: { message: 'Failed to list teams', status: 500 } });
  }
});

// GET /api/v1/teams/invites/pending — list invites for the current user
// (must be before /:id to avoid "invites" being treated as an id)
router.get('/invites/pending', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUser(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const invites = await prisma.teamInvite.findMany({
      where: { toUserId: user.id, status: 'PENDING' },
      include: {
        team: { select: { id: true, name: true } },
        fromUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ invites });
  } catch (error) {
    console.error('Failed to fetch invites:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch invites', status: 500 } });
  }
});

// GET /api/v1/teams/:id — get a single team with members
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUser(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        hackathon: { select: { id: true, name: true, startDate: true, endDate: true, tags: true } },
        members: {
          include: {
            user: {
              include: {
                profile: { select: { skills: true, major: true, photoDataUrl: true } },
              },
            },
          },
        },
        invites: {
          where: { status: 'PENDING' },
          include: { toUser: { select: { id: true, name: true, email: true } } },
        },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!team) return res.status(404).json({ error: { message: 'Team not found', status: 404 } });

    // Check membership
    const isMember = team.members.some((m) => m.userId === user.id);
    if (!isMember) return res.status(403).json({ error: { message: 'Not a member of this team', status: 403 } });

    return res.json({ team });
  } catch (error) {
    console.error('Failed to fetch team:', error);
    return res.status(500).json({ error: { message: 'Failed to fetch team', status: 500 } });
  }
});

// POST /api/v1/teams — create a new team
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUser(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const { name, hackathonId } = req.body;
    if (!name || !hackathonId) {
      return res.status(400).json({ error: { message: 'name and hackathonId are required', status: 400 } });
    }

    const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
    if (!hackathon) return res.status(404).json({ error: { message: 'Hackathon not found', status: 404 } });

    // Creator must have expressed interest in this hackathon
    const interest = await prisma.hackathonInterest.findUnique({
      where: { userId_hackathonId: { userId: user.id, hackathonId } },
    });
    if (!interest) {
      return res.status(400).json({ error: { message: 'You must indicate interest in this hackathon before creating a team', status: 400 } });
    }

    const team = await prisma.team.create({
      data: {
        name: String(name).trim(),
        hackathonId,
        createdById: user.id,
        members: {
          create: { userId: user.id, role: 'LEADER' },
        },
      },
      include: {
        hackathon: { select: { id: true, name: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true, university: true } },
          },
        },
      },
    });

    return res.status(201).json({ team });
  } catch (error) {
    console.error('Failed to create team:', error);
    return res.status(500).json({ error: { message: 'Failed to create team', status: 500 } });
  }
});

// POST /api/v1/teams/:id/invite — invite a user by email
router.post('/:id/invite', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUser(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: { members: true },
    });
    if (!team) return res.status(404).json({ error: { message: 'Team not found', status: 404 } });

    const membership = team.members.find((m) => m.userId === user.id);
    if (!membership) return res.status(403).json({ error: { message: 'Not a member of this team', status: 403 } });

    const { email, message } = req.body;
    if (!email) return res.status(400).json({ error: { message: 'email is required', status: 400 } });

    const targetUser = await prisma.user.findFirst({
      where: { email: { equals: String(email).trim(), mode: 'insensitive' } },
    });
    if (!targetUser) return res.status(404).json({ error: { message: 'User not found with that email', status: 404 } });

    if (team.members.some((m) => m.userId === targetUser.id)) {
      return res.status(400).json({ error: { message: 'User is already a team member', status: 400 } });
    }

    // Invitee must have expressed interest in the hackathon this team belongs to
    const inviteeInterest = await prisma.hackathonInterest.findUnique({
      where: { userId_hackathonId: { userId: targetUser.id, hackathonId: team.hackathonId } },
    });
    if (!inviteeInterest) {
      return res.status(400).json({ error: { message: 'This user has not indicated interest in this hackathon', status: 400 } });
    }

    // Check for existing pending invite
    const existingInvite = await prisma.teamInvite.findFirst({
      where: { teamId: team.id, toUserId: targetUser.id, status: 'PENDING' },
    });
    if (existingInvite) {
      return res.status(400).json({ error: { message: 'Invite already pending for this user', status: 400 } });
    }

    const invite = await prisma.teamInvite.create({
      data: {
        teamId: team.id,
        fromUserId: user.id,
        toUserId: targetUser.id,
        message: message ? String(message).trim() : null,
      },
      include: { toUser: { select: { id: true, name: true, email: true } } },
    });

    return res.status(201).json({ invite });
  } catch (error) {
    console.error('Failed to invite user:', error);
    return res.status(500).json({ error: { message: 'Failed to send invite', status: 500 } });
  }
});

// POST /api/v1/teams/invites/:inviteId/respond — accept or reject an invite
router.post('/invites/:inviteId/respond', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUser(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const invite = await prisma.teamInvite.findUnique({ where: { id: req.params.inviteId } });
    if (!invite || invite.toUserId !== user.id) {
      return res.status(404).json({ error: { message: 'Invite not found', status: 404 } });
    }
    if (invite.status !== 'PENDING') {
      return res.status(400).json({ error: { message: 'Invite already responded to', status: 400 } });
    }

    const { accept } = req.body;
    const newStatus = accept ? 'ACCEPTED' : 'REJECTED';

    await prisma.teamInvite.update({
      where: { id: invite.id },
      data: { status: newStatus },
    });

    if (accept) {
      await prisma.teamMember.create({
        data: { teamId: invite.teamId, userId: user.id, role: 'MEMBER' },
      });
    }

    return res.json({ status: newStatus });
  } catch (error) {
    console.error('Failed to respond to invite:', error);
    return res.status(500).json({ error: { message: 'Failed to respond to invite', status: 500 } });
  }
});

// POST /api/v1/teams/:id/leave — leave a team
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const user = await resolveUser(req.auth.uid);
    if (!user) return res.status(401).json({ error: { message: 'User not found', status: 401 } });

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: req.params.id, userId: user.id } },
    });
    if (!membership) return res.status(404).json({ error: { message: 'Not a member of this team', status: 404 } });

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId: req.params.id, userId: user.id } },
    });

    return res.json({ left: true });
  } catch (error) {
    console.error('Failed to leave team:', error);
    return res.status(500).json({ error: { message: 'Failed to leave team', status: 500 } });
  }
});

module.exports = router;
