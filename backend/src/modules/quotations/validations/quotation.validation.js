// Joi schemas for quotation endpoints.
const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'object id');

const itemSchema = Joi.object({
  rfqItemId: objectId.allow(null, ''),
  name: Joi.string().trim().allow('', null),
  qty: Joi.number().min(0).default(1),
  unitPrice: Joi.number().min(0).required(),
});

const submitQuotationSchema = Joi.object({
  rfqId: objectId.required(),
  // Optional: vendor-role callers are forced to their own vendorId server-side; officers/admins may set it.
  vendorId: objectId,
  vendorName: Joi.string().trim().allow('', null),
  slaScore: Joi.number().min(0).max(100),
  deliveryTime: Joi.string().trim().allow('', null),
  terms: Joi.string().trim().allow('', null),
  validityDate: Joi.string().trim().allow('', null),
  items: Joi.array().items(itemSchema).min(1).required(),
  totalBid: Joi.number().min(0),
});

const updateQuotationSchema = Joi.object({
  deliveryTime: Joi.string().trim().allow('', null),
  terms: Joi.string().trim().allow('', null),
  validityDate: Joi.string().trim().allow('', null),
  items: Joi.array().items(itemSchema).min(1),
  totalBid: Joi.number().min(0),
}).min(1);

const compareSchema = Joi.object({
  rfqId: objectId,
  quotationIds: Joi.array().items(objectId).min(2),
}).or('rfqId', 'quotationIds');

const listQuerySchema = Joi.object({
  rfqId: objectId,
  vendorId: objectId,
  status: Joi.string().valid('Submitted', 'Awarded', 'Rejected'),
});

module.exports = { submitQuotationSchema, updateQuotationSchema, compareSchema, listQuerySchema };
