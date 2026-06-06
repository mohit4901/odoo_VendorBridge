// Role-based access control. Use AFTER `protect`. Admin always passes.
const { ApiError } = require('../../utils/responseHandler');
const { ROLES } = require('../../constants/roles.constants');

/**
 * authorize('officer','manager') -> middleware that allows only those roles (admin bypasses).
 * Called with no args, it allows any authenticated user.
 */
const authorize = (...allowed) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized('Authentication required.'));
  if (allowed.length === 0) return next();
  if (req.user.role === ROLES.ADMIN) return next(); // global bypass
  if (!allowed.includes(req.user.role)) {
    return next(ApiError.forbidden(`Access denied. Requires role: ${allowed.join(' or ')}.`));
  }
  next();
};

module.exports = { authorize };
