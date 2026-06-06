// Invoice data-access.
const { BaseRepository } = require('../../../interfaces');
const Invoice = require('../model/invoice.model');
const { escapeRegex } = require('../../../utils/sanitize');

class InvoiceRepository extends BaseRepository {
  constructor() {
    super(Invoice);
  }

  buildFilter({ status, search } = {}) {
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ invoiceRef: rx }, { poRef: rx }, { vendorName: rx }];
    }
    return filter;
  }

  list(query = {}) {
    return this.find(this.buildFilter(query), { sort: '-createdAt' });
  }

  findByPoRef(poRef) {
    return this.findOne({ poRef });
  }
}

module.exports = new InvoiceRepository();
