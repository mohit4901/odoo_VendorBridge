// Approval routes — /api/v1/approvals  (Manager actions; Admin bypasses)
const express = require('express');
const approvalController = require('../controller/approval.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { ROLES } = require('../../../constants/roles.constants');
const {
  createApprovalSchema,
  actionSchema,
  remarkSchema,
  listQuerySchema,
} = require('../validations/approval.validation');

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.MANAGER, ROLES.OFFICER)); // admin bypasses

router.get('/', validate(listQuerySchema, 'query'), approvalController.list);
router.get('/:id', approvalController.getOne);
router.post('/', validate(createApprovalSchema), approvalController.create);
router.post('/:id/action', authorize(ROLES.MANAGER), validate(actionSchema), approvalController.action);
router.post('/:id/approve', authorize(ROLES.MANAGER), validate(remarkSchema), approvalController.approve);
router.post('/:id/reject', authorize(ROLES.MANAGER), validate(remarkSchema), approvalController.reject);

module.exports = router;
