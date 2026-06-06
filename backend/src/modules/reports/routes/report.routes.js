// Report routes — /api/v1/reports
// Read-only analytics & exports for procurement staff. Admin bypasses authorize(); officer and
// manager are explicitly allowed.
const express = require('express');
const reportController = require('../controller/report.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { ROLES } = require('../../../constants/roles.constants');
const { exportQuerySchema } = require('../validations/report.validation');

const router = express.Router();

router.use(protect);

// All report reads: staff only (admin bypasses, officer + manager allowed).
const staff = authorize(ROLES.OFFICER, ROLES.MANAGER);

router.get('/summary', staff, reportController.summary);
router.get('/spend-by-category', staff, reportController.spendByCategory);
router.get('/spend-trend', staff, reportController.spendTrend);
router.get('/monthly-trend', staff, reportController.monthlyTrend);
router.get('/top-vendors', staff, reportController.topVendors);
router.get('/vendor-performance', staff, reportController.vendorPerformance);
router.get('/rfq-distribution', staff, reportController.rfqDistribution);

// Exports — keep the explicit /export/csv and /export/pdf routes ABOVE the generic /export
// dispatcher so they take precedence.
router.get('/export/csv', staff, reportController.exportCsv);
router.get('/export/pdf', staff, reportController.exportPdf);
router.get('/export', staff, validate(exportQuerySchema, 'query'), reportController.export);

module.exports = router;
