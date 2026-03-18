const express = require('express');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const adminAuthController = require('../controllers/adminAuthController');

const router = express.Router();

router.post('/login', adminAuthController.login);
router.get('/me', adminAuthMiddleware, adminAuthController.me);
router.put('/company/profile', adminAuthMiddleware, adminAuthController.updateProfile);

module.exports = router;
