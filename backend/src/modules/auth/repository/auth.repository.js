// Auth data-access: user lookups for authentication.
const { BaseRepository } = require('../../../interfaces');
const User = require('../model/user.model');

class AuthRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /** Case-insensitive email lookup. Pass withPassword=true for login verification. */
  findByEmail(email, withPassword = false) {
    const q = this.model.findOne({ email: String(email).toLowerCase().trim() });
    if (withPassword) q.select('+password');
    return q.exec();
  }
}

module.exports = new AuthRepository();
