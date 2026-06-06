// Vendor routes — /api/v1/vendors
const express = require('express');
const vendorController = require('../controller/vendor.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { ROLES } = require('../../../constants/roles.constants');
const {
  createVendorSchema,
  updateVendorSchema,
  statusSchema,
  listQuerySchema,
} = require('../validations/vendor.validation');

const router = express.Router();

router.use(protect);

// Self-profile: a vendor can read their own vendor record.
router.get('/me', authorize(ROLES.VENDOR), vendorController.getMyProfile);

// Reads: staff (admin bypasses, officer + manager allowed).
router.get('/', authorize(ROLES.OFFICER, ROLES.MANAGER), validate(listQuerySchema, 'query'), vendorController.list);
router.get('/:id', authorize(ROLES.OFFICER, ROLES.MANAGER), vendorController.getOne);

// Writes: admin + officer.
router.post('/', authorize(ROLES.OFFICER), validate(createVendorSchema), vendorController.create);
router.put('/:id', authorize(ROLES.OFFICER), validate(updateVendorSchema), vendorController.update);
router.delete('/:id', authorize(ROLES.OFFICER), vendorController.remove);
router.patch('/:id/status', authorize(ROLES.OFFICER), validate(statusSchema), vendorController.updateStatus);

// Approval: admin only.
router.post('/:id/approve', authorize(ROLES.ADMIN), vendorController.approve);

module.exports = router;
