// Joi schemas for activity-log endpoints.
const Joi = require('joi');
const { ACTIVITY_TYPE, values } = require('../../../enums/status.enums');

const TAB_LABELS = ['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'];

const createSchema = Joi.object({
  type: Joi.string()
    .valid(...values(ACTIVITY_TYPE))
    .default(ACTIVITY_TYPE.SYSTEM),
  title: Joi.string().trim().min(2).max(200).required(),
  desc: Joi.string().trim().max(1000).allow('', null),
  // `user` is stamped server-side from the authenticated principal; never trust a client value.
  user: Joi.any().strip(),
});

// `type` accepts either a raw activity type or a frontend tab label.
const listQuerySchema = Joi.object({
  type: Joi.string().valid(...values(ACTIVITY_TYPE), ...TAB_LABELS),
});

module.exports = { createSchema, listQuerySchema };
