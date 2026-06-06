// Dashboard routes — /api/v1/dashboard
// Read-only aggregated analytics for the staff home screen (admin/officer/manager; admin bypasses).
const express = require('express');
const dashboardController = require('../controller/dashboard.controller');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { authorize } = require('../../../middleware/role/role.middleware');
const { ROLES } = require('../../../constants/roles.constants');

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.OFFICER, ROLES.MANAGER));

// Everything in one round-trip (preferred by the frontend home screen).
router.get('/summary', dashboardController.summary);

// Individual slices for targeted refreshes.
router.get('/metrics', dashboardController.metrics);
router.get('/pipeline', dashboardController.pipeline);
router.get('/spend-analysis', dashboardController.spendAnalysis);
router.get('/rfq-status', dashboardController.rfqStatus);
router.get('/recent-activity', dashboardController.recentActivity);
router.get('/pending-approvals', dashboardController.pendingApprovals);

module.exports = router;
