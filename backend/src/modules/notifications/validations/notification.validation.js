// Joi schemas for notification endpoints.
const Joi = require('joi');
const { NOTIFICATION_TYPE, values } = require('../../../enums/status.enums');

const createSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  type: Joi.string()
    .valid(...values(NOTIFICATION_TYPE))
    .default(NOTIFICATION_TYPE.INFO),
});

const listQuerySchema = Joi.object({
  unread: Joi.boolean(),
});

module.exports = { createSchema, listQuerySchema };
