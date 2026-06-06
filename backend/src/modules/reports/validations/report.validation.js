// Joi schemas for report endpoints. Reports are read-only analytics; the only user input is the
// export format selector on GET /export.
const Joi = require('joi');

const exportQuerySchema = Joi.object({
  format: Joi.string().valid('csv', 'pdf').default('csv'),
});

module.exports = { exportQuerySchema };
