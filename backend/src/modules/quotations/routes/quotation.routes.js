// Quotation routes — /api/v1/quotations
const express = require('express');
const quotationController = require('../controller/quotation.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { ROLES } = require('../../../constants/roles.constants');
const {
  submitQuotationSchema,
  updateQuotationSchema,
  compareSchema,
  listQuerySchema,
} = require('../validations/quotation.validation');

const router = express.Router();

router.use(protect);

// Static / specific paths before '/:id'.
router.get('/', validate(listQuerySchema, 'query'), quotationController.list);
router.get('/rfq/:rfqId', quotationController.byRfq);
router.post('/compare', authorize(ROLES.OFFICER, ROLES.MANAGER), validate(compareSchema), quotationController.compare);

router.get('/:id', quotationController.getOne);
router.post('/', authorize(ROLES.VENDOR, ROLES.OFFICER), validate(submitQuotationSchema), quotationController.submit);
router.put('/:id', authorize(ROLES.VENDOR, ROLES.OFFICER), validate(updateQuotationSchema), quotationController.update);
router.post('/:id/award', authorize(ROLES.OFFICER, ROLES.MANAGER), quotationController.award);

module.exports = router;
