// Joi schemas for dashboard endpoints.
// All dashboard routes are read-only GETs with no request body, path, or query parameters,
// so there is nothing to validate. This file exists to keep the module layout consistent with the
// reference modules; if query params (e.g. ?range=6m) are added later, define their schema here.
const Joi = require('joi');

// Reserved for future filters (date range, etc.). Currently accepts no keys.
const summaryQuerySchema = Joi.object({});

module.exports = { summaryQuerySchema };
