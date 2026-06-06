// Vendor data-access with directory filtering (status, category, free-text search).
const { BaseRepository } = require('../../../interfaces');
const Vendor = require('../model/vendor.model');
const { VENDOR_STATUS } = require('../../../enums/status.enums');
const { escapeRegex } = require('../../../utils/sanitize');

class VendorRepository extends BaseRepository {
  constructor() {
    super(Vendor);
  }

  /** Translate query params into a Mongo filter. 'All'/empty status = no filter; 'Blocked' aliases 'Blacklisted'. */
  buildFilter({ status, category, search } = {}) {
    const filter = {};
    if (status && status !== 'All') {
      filter.status = status === 'Blocked' ? VENDOR_STATUS.BLACKLISTED : status;
    }
    if (category && category !== 'All') filter.category = category;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: rx }, { category: rx }, { contactPerson: rx }, { email: rx }];
    }
    return filter;
  }

  list(query = {}) {
    return this.find(this.buildFilter(query), { sort: '-createdAt' });
  }
}

module.exports = new VendorRepository();
