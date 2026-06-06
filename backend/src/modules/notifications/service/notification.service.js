// Notification business logic: list, create, mark-read (single/all), remove, clear-all.
const notificationRepository = require('../repository/notification.repository');
const { ApiError } = require('../../../utils/responseHandler');
const { NOTIFICATION_TYPE } = require('../../../enums/status.enums');

const notificationService = {
  list(query = {}) {
    return notificationRepository.list(query);
  },

  create({ title, type = NOTIFICATION_TYPE.INFO } = {}) {
    return notificationRepository.create({ title, type, read: false });
  },

  async markRead(id) {
    const notification = await notificationRepository.markRead(id);
    if (!notification) throw ApiError.notFound('Notification not found.');
    return notification;
  },

  async markAllRead() {
    const result = await notificationRepository.markAllRead();
    return { updated: result.modifiedCount ?? result.nModified ?? 0 };
  },

  async remove(id) {
    const notification = await notificationRepository.deleteById(id);
    if (!notification) throw ApiError.notFound('Notification not found.');
    return notification;
  },

  async clearAll() {
    const result = await notificationRepository.clearAll();
    return { deleted: result.deletedCount ?? 0 };
  },
};

module.exports = notificationService;
