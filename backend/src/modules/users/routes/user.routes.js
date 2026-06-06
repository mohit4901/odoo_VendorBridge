// User routes — /api/v1/users (admin-only account management).
const express = require('express');
const userController = require('../controller/user.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { ROLES } = require('../../../constants/roles.constants');
const {
  createUserSchema,
  updateRoleSchema,
  listQuerySchema,
} = require('../validations/user.validation');

const router = express.Router();

// Every endpoint requires an authenticated admin.
router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/', validate(listQuerySchema, 'query'), userController.list);
router.get('/:id', userController.getOne);
router.post('/', validate(createUserSchema), userController.create);
router.patch('/:id/role', validate(updateRoleSchema), userController.updateRole);
router.delete('/:id', userController.remove);

module.exports = router;
