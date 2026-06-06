// Auth business logic: registration, login, session retrieval.
const mongoose = require('mongoose');
const authRepository = require('../repository/auth.repository');
const { signToken } = require('../../../config/jwt/jwt.config');
const { ApiError } = require('../../../utils/responseHandler');
const events = require('../../../utils/events');
const logger = require('../../../utils/logger');
const { ACTIVITY_TYPE, VENDOR_STATUS } = require('../../../enums/status.enums');
const { ROLES } = require('../../../constants/roles.constants');

const issueToken = (user) => signToken({ id: user.id, role: user.role });

const authService = {
  async register(payload) {
    const existing = await authRepository.findByEmail(payload.email);
    if (existing) throw ApiError.conflict('Email already registered.');

    // SECURITY: self-registration always yields a 'vendor' (role is never taken from the client).
    const user = await authRepository.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: ROLES.VENDOR,
      company: payload.company || payload.name,
      phone: payload.phone,
    });

    // Provision a linked vendor profile (Pending until an admin approves) so the principal can quote.
    try {
      const Vendor = mongoose.model('Vendor');
      const vendor = await Vendor.create({
        name: payload.company || payload.name,
        contactPerson: payload.name,
        email: payload.email,
        phone: payload.phone || '',
        status: VENDOR_STATUS.PENDING,
        userId: user._id,
      });
      user.vendorId = vendor._id;
      await user.save({ validateBeforeSave: false });
      await events.record({
        notification: { title: `New vendor "${vendor.name}" awaiting approval`, type: 'info' },
        activity: {
          title: 'New Vendor Registered',
          desc: `${vendor.name} completed self-onboarding and awaits approval.`,
          type: ACTIVITY_TYPE.VENDOR,
          user: 'System Bot',
        },
      });
    } catch (err) {
      logger.debug('Vendor profile auto-provisioning skipped:', err.message);
      await events.logActivity('New User Registered', `${user.name} joined VendorBridge.`, ACTIVITY_TYPE.SYSTEM, 'System Bot');
    }

    const token = issueToken(user);
    return { user: user.toJSON(), token };
  },

  async login({ email, password }) {
    const user = await authRepository.findByEmail(email, true);
    if (!user) throw ApiError.unauthorized('Invalid email or password.');

    const ok = await user.comparePassword(password);
    if (!ok) throw ApiError.unauthorized('Invalid email or password.');

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = issueToken(user);
    return { user: user.toJSON(), token };
  },

  async getMe(userId) {
    const user = await authRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found.');
    return user.toJSON();
  },

  async changePassword(userId, oldPassword, newPassword) {
    const user = await authRepository.findByIdWithPassword(userId);
    if (!user) throw ApiError.notFound('User not found.');
    const ok = await user.comparePassword(oldPassword);
    if (!ok) throw ApiError.unauthorized('Incorrect old password.');
    user.password = newPassword;
    await user.save();
  },
};

module.exports = authService;
