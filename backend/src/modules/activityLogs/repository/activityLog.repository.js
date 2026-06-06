// ActivityLog data-access with tab-based filtering (mirrors the frontend audit-trail tabs).
const { BaseRepository } = require('../../../interfaces');
const ActivityLog = require('../model/activityLog.model');
const { ACTIVITY_TYPE } = require('../../../enums/status.enums');

// Frontend tab labels -> underlying ActivityLog type(s). 'Approvals' spans approval + PO events.
const TAB_TYPES = {
  All: null,
  RFQ: ACTIVITY_TYPE.RFQ,
  Approvals: [ACTIVITY_TYPE.APPROVAL, ACTIVITY_TYPE.PO],
  Invoices: ACTIVITY_TYPE.INVOICE,
  Vendors: ACTIVITY_TYPE.VENDOR,
};

class ActivityLogRepository extends BaseRepository {
  constructor() {
    super(ActivityLog);
  }

  /** Translate a tab label OR raw type into a Mongo filter. Empty/'All' = no filter. */
  buildFilter({ type } = {}) {
    const filter = {};
    if (!type || type === 'All') return filter;

    // Accept a tab label (e.g. 'Approvals') ...
    if (Object.prototype.hasOwnProperty.call(TAB_TYPES, type)) {
      const mapped = TAB_TYPES[type];
      if (Array.isArray(mapped)) filter.type = { $in: mapped };
      else if (mapped) filter.type = mapped;
      return filter;
    }

    // ... or a raw type string (e.g. 'rfq', 'po').
    filter.type = String(type).toLowerCase();
    return filter;
  }

  list(query = {}) {
    return this.find(this.buildFilter(query), { sort: '-createdAt' });
  }
}

module.exports = new ActivityLogRepository();
