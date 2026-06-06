// Joi schemas for approval endpoints.
const Joi = require('joi');
const { APPROVAL_STATUS, values } = require('../../../enums/status.enums');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'object id');

const itemSchema = Joi.object({
  name: Joi.string().trim().required(),
  qty: Joi.number().min(0).default(1),
  price: Joi.number().min(0).default(0),
});

// Manually create an approval workflow (normally created automatically on award).
const createApprovalSchema = Joi.object({
  rfqId: objectId.allow(null, ''),
  rfqTitle: Joi.string().trim().required(),
  vendorId: objectId.allow(null, ''),
  vendorName: Joi.string().trim().required(),
  quotationId: objectId.allow(null, ''),
  amount: Joi.number().min(0).required(),
  items: Joi.array().items(itemSchema).default([]),
});

const actionSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  remark: Joi.string().trim().allow('', null),
});

const remarkSchema = Joi.object({
  remark: Joi.string().trim().allow('', null),
});

const listQuerySchema = Joi.object({
  status: Joi.string().valid(...values(APPROVAL_STATUS), 'All'),
  vendorId: objectId,
});

module.exports = { createApprovalSchema, actionSchema, remarkSchema, listQuerySchema };
