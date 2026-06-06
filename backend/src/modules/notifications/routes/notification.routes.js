// Notification routes — /api/v1/notifications
const express = require('express');
const notificationController = require('../controller/notification.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { ROLES } = require('../../../constants/roles.constants');
const { createSchema, listQuerySchema } = require('../validations/notification.validation');

const router = express.Router();

router.use(protect);

// Reads + individual dismiss: any authenticated user.
router.get('/', validate(listQuerySchema, 'query'), notificationController.list);

// Operations affecting the shared feed (inject / mark-all / clear-all): staff only (admin bypasses).
const staff = authorize(ROLES.OFFICER, ROLES.MANAGER);
router.post('/', staff, validate(createSchema), notificationController.create);

// Static routes before parameterized ones so '/read-all' isn't captured by '/:id'.
router.patch('/read-all', staff, notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

router.delete('/', staff, notificationController.clearAll);
router.delete('/:id', notificationController.remove);

module.exports = router;
