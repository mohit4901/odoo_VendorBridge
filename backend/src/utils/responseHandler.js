// Standardized API response envelope: { success, data, message } — consumed by the frontend services layer.
const ApiError = require('./ApiError');

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {*} data        payload placed under `data`
 * @param {string} message human-readable message
 * @param {number} statusCode default 200
 * @param {object} [meta]  optional extra top-level fields (e.g. pagination)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = undefined) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const sendCreated = (res, data, message = 'Created successfully') =>
  sendSuccess(res, data, message, 201);

/**
 * Send an error response in the same envelope.
 */
const sendError = (res, message = 'Something went wrong', statusCode = 500, errors = []) =>
  res.status(statusCode).json({ success: false, message, data: null, errors });

/**
 * Wrap async route handlers so thrown/rejected errors flow to the error middleware.
 * @param {Function} fn async (req,res,next) => {}
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { sendSuccess, sendCreated, sendError, asyncHandler, ApiError };
