// Auth routes — /api/v1/auth
const express = require('express');
const authController = require('../controller/auth.controller');
const { validate } = require('../../../middleware/validation/validation.middleware');
const { protect } = require('../../../middleware/auth/auth.middleware');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;
