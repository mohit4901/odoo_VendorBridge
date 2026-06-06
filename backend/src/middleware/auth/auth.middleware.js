// Authenticates requests by validating the JWT from the Authorization header (Bearer) or the auth cookie.
// On success attaches `req.user` (the Mongoose user doc) and `req.auth` (decoded token payload).
const mongoose = require('mongoose');
const { verifyToken, AUTH_COOKIE } = require('../../config/jwt/jwt.config');
const { asyncHandler, ApiError } = require('../../utils/responseHandler');

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  if (req.cookies && req.cookies[AUTH_COOKIE]) return req.cookies[AUTH_COOKIE];
  return null;
};

/**
 * Require a valid session. Loads the user fresh from the DB so role/status changes take effect.
 */
const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required. Please log in.');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw ApiError.unauthorized(
      err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid authentication token.'
    );
  }

  const User = mongoose.model('User');
  const user = await User.findById(decoded.id).select('-password');
  if (!user) throw ApiError.unauthorized('Account no longer exists.');

  req.user = user;
  req.auth = decoded;
  next();
});

/**
 * Optional auth: attaches req.user when a valid token is present, but never rejects.
 */
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = verifyToken(token);
      const User = mongoose.model('User');
      req.user = await User.findById(decoded.id).select('-password');
      req.auth = decoded;
    } catch {
      /* ignore — treat as anonymous */
    }
  }
  next();
});

module.exports = { protect, optionalAuth, extractToken };
