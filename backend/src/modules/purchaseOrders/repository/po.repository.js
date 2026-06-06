// Purchase order data-access.
const { BaseRepository } = require('../../../interfaces');
const PurchaseOrder = require('../model/purchaseOrder.model');
const { escapeRegex } = require('../../../utils/sanitize');

class PoRepository extends BaseRepository {
  constructor() {
    super(PurchaseOrder);
  }

  buildFilter({ status, vendorId, search } = {}) {
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (vendorId) filter.vendorId = vendorId;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ poRef: rx }, { vendorName: rx }, { rfqTitle: rx }];
    }
    return filter;
  }

  list(query = {}) {
    return this.find(this.buildFilter(query), { sort: '-createdAt' });
  }

  nextSequence() {
    return this.count();
  }
}

module.exports = new PoRepository();
