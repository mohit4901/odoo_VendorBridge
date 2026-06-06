// Joi schemas for invoice endpoints.
const Joi = require('joi');
const { INVOICE_STATUS, values } = require('../../../enums/status.enums');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'object id');

// Generate an invoice from a Purchase Order.
const generateInvoiceSchema = Joi.object({
  poId: objectId.required(),
});

const emailSchema = Joi.object({
  to: Joi.string().email().allow('', null),
  subject: Joi.string().trim().allow('', null),
});

const listQuerySchema = Joi.object({
  status: Joi.string().valid(...values(INVOICE_STATUS), 'All'),
  search: Joi.string().trim().allow('', null),
});

module.exports = { generateInvoiceSchema, emailSchema, listQuerySchema };
