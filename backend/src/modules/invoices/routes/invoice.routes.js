// Invoice routes — /api/v1/invoices
const express = require('express');
const invoiceController = require('../controller/invoice.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { ROLES } = require('../../../constants/roles.constants');
const { generateInvoiceSchema, emailSchema, listQuerySchema } = require('../validations/invoice.validation');

const router = express.Router();

router.use(protect);

// Reads + document rendering: any authenticated user.
router.get('/', validate(listQuerySchema, 'query'), invoiceController.list);
router.get('/:id', invoiceController.getOne);
router.get('/:id/pdf', invoiceController.downloadPdf);
router.get('/:id/print', invoiceController.printView);

// Post an invoice (vendor) / officer.
router.post('/', authorize(ROLES.VENDOR, ROLES.OFFICER), validate(generateInvoiceSchema), invoiceController.generate);

// Confirm payment: officer/manager.
router.patch('/:id/pay', authorize(ROLES.OFFICER, ROLES.MANAGER), invoiceController.pay);

// Email the invoice: officer/manager/vendor.
router.post('/:id/email', authorize(ROLES.OFFICER, ROLES.MANAGER, ROLES.VENDOR), validate(emailSchema), invoiceController.email);

module.exports = router;
