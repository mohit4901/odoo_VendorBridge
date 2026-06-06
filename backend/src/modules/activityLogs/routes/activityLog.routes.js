// Activity-log routes — /api/v1/activity-logs
const express = require('express');
const activityLogController = require('../controller/activityLog.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { ROLES } = require('../../../constants/roles.constants');
const { createSchema, listQuerySchema } = require('../validations/activityLog.validation');

const router = express.Router();

// The audit trail is staff-only (admin/officer/manager; admin bypasses). Vendors have no access.
router.use(protect);
router.use(authorize(ROLES.OFFICER, ROLES.MANAGER));

// CSV export — declared before '/' so it is not shadowed; reuses the same tab filter.
router.get('/export', validate(listQuerySchema, 'query'), activityLogController.exportCsv);

router.get('/', validate(listQuerySchema, 'query'), activityLogController.list);
router.post('/', validate(createSchema), activityLogController.create);

module.exports = router;
