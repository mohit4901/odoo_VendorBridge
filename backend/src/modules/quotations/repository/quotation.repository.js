// Quotation data-access.
const { BaseRepository } = require('../../../interfaces');
const Quotation = require('../model/quotation.model');

class QuotationRepository extends BaseRepository {
  constructor() {
    super(Quotation);
  }

  buildFilter({ rfqId, vendorId, status } = {}) {
    const filter = {};
    if (rfqId) filter.rfqId = rfqId;
    if (vendorId) filter.vendorId = vendorId;
    if (status) filter.status = status;
    return filter;
  }

  list(query = {}) {
    return this.find(this.buildFilter(query), { sort: '-createdAt' });
  }

  listByRfq(rfqId) {
    return this.find({ rfqId }, { sort: 'totalBid' });
  }

  findByVendorAndRfq(vendorId, rfqId) {
    return this.findOne({ vendorId, rfqId });
  }
}

module.exports = new QuotationRepository();
