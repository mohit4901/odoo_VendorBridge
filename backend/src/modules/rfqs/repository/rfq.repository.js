// RFQ data-access with directory filtering and vendor population.
const { BaseRepository } = require('../../../interfaces');
const RFQ = require('../model/rfq.model');
const { escapeRegex } = require('../../../utils/sanitize');

const VENDOR_POPULATE = { path: 'vendorIds', select: 'name category slaScore status' };

class RfqRepository extends BaseRepository {
  constructor() {
    super(RFQ);
  }

  buildFilter({ status, category, search, vendorId } = {}) {
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.category = category;
    if (vendorId) filter.vendorIds = vendorId;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: rx }, { description: rx }, { category: rx }, { rfqNumber: rx }];
    }
    return filter;
  }

  list(query = {}) {
    return this.find(this.buildFilter(query), { sort: '-createdAt', populate: VENDOR_POPULATE });
  }

  getById(id) {
    return this.findById(id, { populate: VENDOR_POPULATE });
  }

  /** Count for generating the next sequential rfqNumber. */
  nextSequence() {
    return this.count();
  }
}

module.exports = new RfqRepository();
