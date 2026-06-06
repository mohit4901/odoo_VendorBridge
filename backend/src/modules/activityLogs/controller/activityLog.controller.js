// Activity-log controller — maps requests to the activity-log service.
const activityLogService = require('../service/activityLog.service');
const { asyncHandler, sendSuccess, sendCreated } = require('../../../utils/responseHandler');

const activityLogController = {
  list: asyncHandler(async (req, res) => {
    const logs = await activityLogService.list(req.query);
    return sendSuccess(res, logs, 'Activity logs fetched');
  }),

  create: asyncHandler(async (req, res) => {
    // Stamp the actor server-side so audit entries cannot be attributed to an arbitrary user.
    const log = await activityLogService.create({ ...req.body, user: req.user.name });
    return sendCreated(res, log, 'Activity log created');
  }),

  exportCsv: asyncHandler(async (req, res) => {
    const csv = await activityLogService.exportCsv(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="activity-logs-${Date.now()}.csv"`);
    return res.send(csv);
  }),
};

module.exports = activityLogController;
