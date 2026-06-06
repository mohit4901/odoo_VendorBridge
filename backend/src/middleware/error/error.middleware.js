// Global error handling: a 404 catch-all and a normalizer that maps common errors
// (ApiError, Mongoose validation/cast/duplicate-key, JWT) to the { success,message,errors } envelope.
const ApiError = require('../../utils/ApiError');
const { sendError } = require('../../utils/responseHandler');
const logger = require('../../utils/logger');
const config = require('../../config/env');

const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  if (err.name === 'ValidationError' && err.errors) {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for "${err.path}": ${err.value}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value: a record with that ${field} already exists.`;
    errors = [{ field, message }];
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again.';
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} →`, err.stack || err.message);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${statusCode} ${message}`);
  }

  const body = { success: false, message, data: null, errors };
  if (!config.isProd && statusCode >= 500) body.stack = err.stack;
  return res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };
