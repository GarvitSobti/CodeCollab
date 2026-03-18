const express = require('express');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const adminAnalyticsController = require('../controllers/adminAnalyticsController');

const router = express.Router();

router.use(adminAuthMiddleware);

router.get('/audit/logs', adminAnalyticsController.auditLogs);
router.get('/:hackathonId/registrations', adminAnalyticsController.registrations);
router.get('/:hackathonId/demographics', adminAnalyticsController.demographics);
router.get('/:hackathonId/skills', adminAnalyticsController.skills);
router.get('/:hackathonId/engagement', adminAnalyticsController.engagement);
router.get('/:hackathonId/talent', adminAnalyticsController.talent);
router.get('/:hackathonId/export', adminAnalyticsController.exportParticipants);

module.exports = router;
