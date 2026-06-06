// Joi schemas for the auth endpoints.
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(128).required(),
  // SECURITY: public self-registration is always a 'vendor'. Any client-supplied role is stripped to
  // prevent privilege escalation. Privileged accounts are provisioned only via the admin /users endpoints.
  role: Joi.any().strip(),
  company: Joi.string().trim().max(160).allow('', null),
  phone: Joi.string().trim().max(40).allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
