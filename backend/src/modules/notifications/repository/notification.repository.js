// Notification data-access: listing (optionally unread-only) and bulk read/clear operations.
const { BaseRepository } = require('../../../interfaces');
const Notification = require('../model/notification.model');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  /** Newest-first list (bounded); pass { unread: true } to return only unread notifications. */
  list({ unread, limit = 50 } = {}) {
    const filter = {};
    if (unread) filter.read = false;
    const capped = Math.min(Math.max(Number(limit) || 50, 1), 200);
    return this.find(filter, { sort: '-createdAt', limit: capped });
  }

  /** Mark a single notification as read; returns the updated doc (or null if not found). */
  markRead(id) {
    return this.updateById(id, { read: true });
  }

  /** Mark every unread notification as read; returns the bulk write result. */
  markAllRead() {
    return this.model.updateMany({ read: false }, { read: true }).exec();
  }

  /** Delete all notifications; returns the bulk delete result. */
  clearAll() {
    return this.deleteMany({});
  }
}

module.exports = new NotificationRepository();
