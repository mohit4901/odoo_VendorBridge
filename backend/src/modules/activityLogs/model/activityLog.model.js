// ActivityLog — immutable audit-trail entry. Owned by this module; events.js writes here.
// Field names match the frontend audit timeline (type, title, desc, user, relative `time`).
const mongoose = require('mongoose');
const { ACTIVITY_TYPE, values } = require('../../../enums/status.enums');
const { applyToJSON } = require('../../../utils/mongoose');
const { timeAgo } = require('../../../utils/time');

const activityLogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: values(ACTIVITY_TYPE), default: ACTIVITY_TYPE.SYSTEM },
    title: { type: String, required: [true, 'Activity title is required'], trim: true },
    desc: { type: String, trim: true, default: '' },
    user: { type: String, trim: true, default: 'System Bot' },
  },
  { timestamps: true }
);

// Human-relative timestamp the frontend renders verbatim ("2 hours ago").
activityLogSchema.virtual('time').get(function getTime() {
  return timeAgo(this.createdAt);
});

applyToJSON(activityLogSchema);

module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
