// Auth routes — /api/v1/auth
const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controller/auth.controller');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validations/auth.validation');

const router = express.Router();

// Brute-force protection: 15 attempts per IP per 15-minute window.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', protect, authController.getMe);
router.put('/password', protect, validate(changePasswordSchema), authController.changePassword);
router.post('/logout', protect, authController.logout);

module.exports = router;
