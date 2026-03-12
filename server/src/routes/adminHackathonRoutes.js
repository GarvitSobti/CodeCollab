const express = require('express');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { allowRoles } = require('../middleware/rbacMiddleware');
const { ROLES } = require('../services/adminDataStore');
const adminHackathonController = require('../controllers/adminHackathonController');

const router = express.Router();

router.use(adminAuthMiddleware);

router.get('/', adminHackathonController.list);
router.post('/', allowRoles(ROLES.SUPER_ADMIN, ROLES.EDITOR), adminHackathonController.create);
router.put('/:id', allowRoles(ROLES.SUPER_ADMIN, ROLES.EDITOR), adminHackathonController.update);
router.post('/:id/publish', allowRoles(ROLES.SUPER_ADMIN, ROLES.EDITOR), adminHackathonController.publish);
router.post('/:id/clone', allowRoles(ROLES.SUPER_ADMIN, ROLES.EDITOR), adminHackathonController.clone);
router.post('/:id/archive', allowRoles(ROLES.SUPER_ADMIN, ROLES.EDITOR), adminHackathonController.archive);
router.delete('/:id', allowRoles(ROLES.SUPER_ADMIN), adminHackathonController.remove);

module.exports = router;
