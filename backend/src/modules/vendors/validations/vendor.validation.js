// Joi schemas for vendor endpoints.
const Joi = require('joi');
const { VENDOR_STATUS, VENDOR_CATEGORY } = require('../../../enums/status.enums');

const statusValues = [...Object.values(VENDOR_STATUS), 'Blocked']; // tolerate legacy alias

const createVendorSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160).required(),
  category: Joi.string()
    .valid(...VENDOR_CATEGORY)
    .default('Office Furniture'),
  contactPerson: Joi.string().trim().max(120).allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().max(40).allow('', null),
  slaScore: Joi.number().min(0).max(100).default(80),
  status: Joi.string()
    .valid(...statusValues)
    .default(VENDOR_STATUS.PENDING),
  gstNumber: Joi.string().trim().max(40).allow('', null),
});

const updateVendorSchema = createVendorSchema.fork(
  ['name', 'category', 'slaScore', 'status'],
  (s) => s.optional()
);

const statusSchema = Joi.object({
  status: Joi.string()
    .valid(...statusValues)
    .required(),
});

const listQuerySchema = Joi.object({
  status: Joi.string().valid(...statusValues, 'All'),
  category: Joi.string().valid(...VENDOR_CATEGORY, 'All'),
  search: Joi.string().trim().allow('', null),
});

module.exports = { createVendorSchema, updateVendorSchema, statusSchema, listQuerySchema };
