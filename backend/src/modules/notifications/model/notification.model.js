// Notification — in-app alert shown in the bell/notification dropdown. Owned by this module;
// events.js creates these docs cross-module. Field names match the frontend NotificationContext.
const mongoose = require('mongoose');
const { NOTIFICATION_TYPE, values } = require('../../../enums/status.enums');
const { applyToJSON } = require('../../../utils/mongoose');
const { timeAgo } = require('../../../utils/time');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Notification title is required'], trim: true },
    type: { type: String, enum: values(NOTIFICATION_TYPE), default: NOTIFICATION_TYPE.INFO },
    read: { type: Boolean, default: false },
    // Optional recipient — when null the notification is global (visible to all staff).
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Relative "time" string ("Just now", "10 minutes ago") consumed directly by the frontend.
notificationSchema.virtual('time').get(function getTime() {
  return timeAgo(this.createdAt);
});

applyToJSON(notificationSchema);

notificationSchema.index({ read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
