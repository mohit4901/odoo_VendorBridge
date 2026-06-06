// RFQ routes — /api/v1/rfqs
const express = require('express');
const rfqController = require('../controller/rfq.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { ROLES } = require('../../../constants/roles.constants');
const {
  createRfqSchema,
  updateRfqSchema,
  statusSchema,
  assignSchema,
  listQuerySchema,
} = require('../validations/rfq.validation');

const router = express.Router();

router.use(protect);

// Any authenticated user (incl. vendors viewing assigned RFQs) can read.
router.get('/', validate(listQuerySchema, 'query'), rfqController.list);
router.get('/:id', rfqController.getOne);

// Authoring is officer (admin bypasses).
router.post('/', authorize(ROLES.OFFICER), validate(createRfqSchema), rfqController.create);
router.put('/:id', authorize(ROLES.OFFICER), validate(updateRfqSchema), rfqController.update);
router.patch('/:id/status', authorize(ROLES.OFFICER, ROLES.MANAGER), validate(statusSchema), rfqController.updateStatus);
router.patch('/:id/assign', authorize(ROLES.OFFICER), validate(assignSchema), rfqController.assign);
router.post('/:id/publish', authorize(ROLES.OFFICER), rfqController.publish);

module.exports = router;
