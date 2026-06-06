// Auth controller: maps HTTP requests to the auth service and manages the auth cookie.
const authService = require('../service/auth.service');
const { asyncHandler, sendSuccess, sendCreated } = require('../../../utils/responseHandler');
const { AUTH_COOKIE, cookieOptions } = require('../../../config/jwt/jwt.config');

const authController = {
  register: asyncHandler(async (req, res) => {
    const { user, token } = await authService.register(req.body);
    res.cookie(AUTH_COOKIE, token, cookieOptions());
    return sendCreated(res, { user, token }, 'Registration successful');
  }),

  login: asyncHandler(async (req, res) => {
    const { user, token } = await authService.login(req.body);
    res.cookie(AUTH_COOKIE, token, cookieOptions());
    return sendSuccess(res, { user, token }, 'Login successful');
  }),

  getMe: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, { user }, 'Current user');
  }),

  logout: asyncHandler(async (_req, res) => {
    res.clearCookie(AUTH_COOKIE, cookieOptions());
    return sendSuccess(res, null, 'Logged out');
  }),

  changePassword: asyncHandler(async (req, res) => {
    await authService.changePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
    return sendSuccess(res, null, 'Password updated successfully');
  }),
};

module.exports = authController;
