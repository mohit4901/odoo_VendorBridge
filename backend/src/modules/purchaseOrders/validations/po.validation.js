// Joi schemas for purchase-order endpoints.
const Joi = require('joi');
const { PO_STATUS, values } = require('../../../enums/status.enums');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'object id');

// Generate a PO from an approval or an awarded quotation.
const generatePoSchema = Joi.object({
  approvalId: objectId,
  quotationId: objectId,
}).or('approvalId', 'quotationId');

const statusSchema = Joi.object({
  status: Joi.string()
    .valid(...values(PO_STATUS))
    .required(),
});

const listQuerySchema = Joi.object({
  status: Joi.string().valid(...values(PO_STATUS), 'All'),
  vendorId: objectId,
  search: Joi.string().trim().allow('', null),
});

module.exports = { generatePoSchema, statusSchema, listQuerySchema };
