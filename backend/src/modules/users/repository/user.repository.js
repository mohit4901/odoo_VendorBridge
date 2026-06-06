// User data-access for admin account management (role filtering, free-text search).
// Reuses the auth User model. Passwords are never returned (User.password is select:false).
const { BaseRepository } = require('../../../interfaces');
const User = require('../../auth/model/user.model');
const { escapeRegex } = require('../../../utils/sanitize');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /** Translate query params into a Mongo filter. role = exact; search = regex over name/email/company. */
  buildFilter({ role, search } = {}) {
    const filter = {};
    if (role && role !== 'All') filter.role = role;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: rx }, { email: rx }, { company: rx }];
    }
    return filter;
  }

  /** Case-insensitive email lookup (used to guard against duplicate accounts). */
  findByEmail(email) {
    return this.model.findOne({ email: String(email).toLowerCase().trim() }).exec();
  }

  list(query = {}) {
    return this.find(this.buildFilter(query), { sort: '-createdAt' });
  }
}

module.exports = new UserRepository();
