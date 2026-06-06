// Notification controller — maps requests to the notification service.
const notificationService = require('../service/notification.service');
const { asyncHandler, sendSuccess, sendCreated } = require('../../../utils/responseHandler');

const notificationController = {
  list: asyncHandler(async (req, res) => {
    const notifications = await notificationService.list(req.query);
    return sendSuccess(res, notifications, 'Notifications fetched');
  }),

  create: asyncHandler(async (req, res) => {
    const notification = await notificationService.create(req.body);
    return sendCreated(res, notification, 'Notification created');
  }),

  markRead: asyncHandler(async (req, res) => {
    const notification = await notificationService.markRead(req.params.id);
    return sendSuccess(res, notification, 'Notification marked as read');
  }),

  markAllRead: asyncHandler(async (req, res) => {
    const result = await notificationService.markAllRead();
    return sendSuccess(res, result, 'All notifications marked as read');
  }),

  remove: asyncHandler(async (req, res) => {
    await notificationService.remove(req.params.id);
    return sendSuccess(res, null, 'Notification deleted');
  }),

  clearAll: asyncHandler(async (req, res) => {
    const result = await notificationService.clearAll();
    return sendSuccess(res, result, 'All notifications cleared');
  }),
};

module.exports = notificationController;
