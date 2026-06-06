// Admin user-account management: list, fetch, create, role changes, removal. Emits audit logs.
const userRepository = require('../repository/user.repository');
const { ApiError } = require('../../../utils/responseHandler');
const events = require('../../../utils/events');
const { ACTIVITY_TYPE } = require('../../../enums/status.enums');

const userService = {
  list(query) {
    return userRepository.list(query);
  },

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound('User not found.');
    return user;
  },

  async create(payload) {
    const existing = await userRepository.findByEmail(payload.email);
    if (existing) throw ApiError.conflict('Email already registered.');

    // Password hashing is handled by the User model's pre-save hook.
    const user = await userRepository.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      company: payload.company || 'VendorBridge Corp',
    });

    await events.logActivity(
      'User Account Created',
      `${user.name} (${user.role}) added by an administrator.`,
      ACTIVITY_TYPE.SYSTEM,
      'System Bot'
    );
    return user;
  },

  async updateRole(id, role) {
    const user = await userRepository.updateById(id, { role });
    if (!user) throw ApiError.notFound('User not found.');
    await events.logActivity(
      'User Role Updated',
      `${user.name} role changed to ${role}.`,
      ACTIVITY_TYPE.SYSTEM,
      'System Bot'
    );
    return user;
  },

  async remove(id) {
    const user = await userRepository.deleteById(id);
    if (!user) throw ApiError.notFound('User not found.');
    await events.logActivity(
      'User Account Removed',
      `${user.name} (${user.email}) removed by an administrator.`,
      ACTIVITY_TYPE.SYSTEM,
      'System Bot'
    );
    return user;
  },
};

module.exports = userService;
