// Purchase-order routes — /api/v1/purchase-orders
const express = require('express');
const poController = require('../controller/po.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { ROLES } = require('../../../constants/roles.constants');
const { generatePoSchema, statusSchema, listQuerySchema } = require('../validations/po.validation');

const router = express.Router();

router.use(protect);

// Reads: any authenticated user (vendors see their POs in the UI).
router.get('/', validate(listQuerySchema, 'query'), poController.list);
router.get('/:id', poController.getOne);

// Generate a PO: officer/manager (admin bypasses).
router.post('/', authorize(ROLES.OFFICER, ROLES.MANAGER), validate(generatePoSchema), poController.generate);

// Delivery-status updates: vendor or officer (admin bypasses).
router.patch('/:id/status', authorize(ROLES.VENDOR, ROLES.OFFICER), validate(statusSchema), poController.updateStatus);

module.exports = router;
