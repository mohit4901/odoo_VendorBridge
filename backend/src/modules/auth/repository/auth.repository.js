// Auth data-access: user lookups for authentication.
// Auth needs full Mongoose documents (not lean) because it calls instance methods
// like .comparePassword() and .toJSON() — so we override the lean defaults.
const { BaseRepository } = require('../../../interfaces');
const User = require('../model/user.model');

class AuthRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /** Override: auth needs full Mongoose docs for instance methods. */
  findById(id) {
    return this.model.findById(id).exec();
  }

  /** Case-insensitive email lookup. Pass withPassword=true for login verification. */
  findByEmail(email, withPassword = false) {
    const q = this.model.findOne({ email: String(email).toLowerCase().trim() });
    if (withPassword) q.select('+password');
    return q.exec();
  }

  findByIdWithPassword(id) {
    return this.model.findById(id).select('+password').exec();
  }
}

module.exports = new AuthRepository();
