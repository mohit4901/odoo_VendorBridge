// Joi-backed request validation. Each module exports Joi schemas; routes wire them via validate(schema).
const { ApiError } = require('../../utils/responseHandler');

/**
 * validate(schema, 'body'|'query'|'params')
 * Validates and REPLACES req[property] with the coerced/cleaned value (unknown keys stripped).
 */
const validate = (schema, property = 'body') => (req, _res, next) => {
  if (!schema) return next();
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/"/g, ''),
    }));
    return next(ApiError.badRequest('Validation failed', errors));
  }
  req[property] = value;
  next();
};

module.exports = { validate };
