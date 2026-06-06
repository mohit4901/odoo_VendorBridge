// Joi schemas for RFQ endpoints.
const Joi = require('joi');
const { RFQ_STATUS, values } = require('../../../enums/status.enums');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'object id');

const itemSchema = Joi.object({
  name: Joi.string().trim().required(),
  qty: Joi.number().min(0).default(1),
  uom: Joi.string().trim().default('Units'),
});

const createRfqSchema = Joi.object({
  rfqNumber: Joi.string().trim().allow('', null),
  title: Joi.string().trim().min(2).required(),
  category: Joi.string().trim().allow('', null),
  deliveryDate: Joi.string().trim().allow('', null),
  description: Joi.string().trim().allow('', null),
  status: Joi.string().valid(...values(RFQ_STATUS)),
  vendorIds: Joi.array().items(objectId).default([]),
  items: Joi.array().items(itemSchema).default([]),
  createdBy: Joi.string().trim().allow('', null),
});

const updateRfqSchema = Joi.object({
  title: Joi.string().trim().min(2),
  category: Joi.string().trim().allow('', null),
  deliveryDate: Joi.string().trim().allow('', null),
  description: Joi.string().trim().allow('', null),
  vendorIds: Joi.array().items(objectId),
  items: Joi.array().items(itemSchema),
}).min(1);

const statusSchema = Joi.object({
  status: Joi.string()
    .valid(...values(RFQ_STATUS))
    .required(),
});

const assignSchema = Joi.object({
  vendorIds: Joi.array().items(objectId).min(1).required(),
});

const listQuerySchema = Joi.object({
  status: Joi.string().valid(...values(RFQ_STATUS), 'All'),
  category: Joi.string().trim(),
  search: Joi.string().trim().allow('', null),
  vendorId: objectId,
});

module.exports = { createRfqSchema, updateRfqSchema, statusSchema, assignSchema, listQuerySchema };
