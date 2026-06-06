// Cross-cutting event emitter for in-app notifications and audit-trail logs.
// Decoupled: resolves the Notification / ActivityLog models at call time so any service can
// emit events without importing those modules. Never throws into the caller.
const mongoose = require('mongoose');
const logger = require('./logger');
const { NOTIFICATION_TYPE, ACTIVITY_TYPE } = require('../enums/status.enums');

const model = (name) => {
  try {
    return mongoose.model(name);
  } catch {
    return null;
  }
};

const notify = async (title, type = NOTIFICATION_TYPE.INFO, extra = {}) => {
  const Notification = model('Notification');
  if (!Notification) return null;
  try {
    return await Notification.create({ title, type, read: false, ...extra });
  } catch (err) {
    logger.debug('notify failed:', err.message);
    return null;
  }
};

const logActivity = async (title, desc, type = ACTIVITY_TYPE.SYSTEM, user = 'System Bot', extra = {}) => {
  const ActivityLog = model('ActivityLog');
  if (!ActivityLog) return null;
  try {
    return await ActivityLog.create({ title, desc, type, user, ...extra });
  } catch (err) {
    logger.debug('logActivity failed:', err.message);
    return null;
  }
};

/**
 * Emit a notification and/or audit log in one call.
 * @param {{notification?:{title:string,type?:string,extra?:object}, activity?:{title:string,desc:string,type?:string,user?:string,extra?:object}}} payload
 */
const record = async ({ notification, activity } = {}) => {
  const out = {};
  if (notification) out.notification = await notify(notification.title, notification.type, notification.extra);
  if (activity) out.activity = await logActivity(activity.title, activity.desc, activity.type, activity.user, activity.extra);
  return out;
};

module.exports = { notify, logActivity, record, NOTIFICATION_TYPE, ACTIVITY_TYPE };
