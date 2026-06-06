// Dashboard controller — exposes the aggregated home-screen overview and its individual slices.
const dashboardService = require('../service/dashboard.service');
const { asyncHandler, sendSuccess } = require('../../../utils/responseHandler');

const dashboardController = {
  summary: asyncHandler(async (_req, res) => {
    const data = await dashboardService.getSummary();
    return sendSuccess(res, data, 'Dashboard summary fetched');
  }),

  metrics: asyncHandler(async (_req, res) => {
    const data = await dashboardService.getMetrics();
    return sendSuccess(res, data, 'Dashboard metrics fetched');
  }),

  pipeline: asyncHandler(async (_req, res) => {
    const data = await dashboardService.getPipeline();
    return sendSuccess(res, data, 'Pipeline counts fetched');
  }),

  spendAnalysis: asyncHandler(async (_req, res) => {
    const data = await dashboardService.getSpendingBreakdown();
    return sendSuccess(res, data, 'Spending breakdown fetched');
  }),

  rfqStatus: asyncHandler(async (_req, res) => {
    const data = await dashboardService.getRfqStatusBreakdown();
    return sendSuccess(res, data, 'RFQ status breakdown fetched');
  }),

  recentActivity: asyncHandler(async (_req, res) => {
    const data = await dashboardService.getRecentActivities();
    return sendSuccess(res, data, 'Recent activity fetched');
  }),

  pendingApprovals: asyncHandler(async (_req, res) => {
    const data = await dashboardService.getPendingApprovals();
    return sendSuccess(res, data, 'Pending approvals fetched');
  }),
};

module.exports = dashboardController;
