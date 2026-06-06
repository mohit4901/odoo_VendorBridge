// Joi schemas for admin user-account endpoints.
const Joi = require('joi');
const { ROLE_VALUES } = require('../../../constants/roles.constants');

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string()
    .valid(...ROLE_VALUES)
    .required(),
  company: Joi.string().trim().max(160).allow('', null),
});

const updateRoleSchema = Joi.object({
  role: Joi.string()
    .valid(...ROLE_VALUES)
    .required(),
});

const listQuerySchema = Joi.object({
  role: Joi.string().valid(...ROLE_VALUES, 'All'),
  search: Joi.string().trim().allow('', null),
});

module.exports = { createUserSchema, updateRoleSchema, listQuerySchema };
