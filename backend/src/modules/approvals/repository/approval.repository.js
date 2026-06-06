// Approval data-access.
const { BaseRepository } = require('../../../interfaces');
const Approval = require('../model/approvalWorkflow.model');
const { APPROVAL_STATUS } = require('../../../enums/status.enums');

class ApprovalRepository extends BaseRepository {
  constructor() {
    super(Approval);
  }

  buildFilter({ status, vendorId } = {}) {
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (vendorId) filter.vendorId = vendorId;
    return filter;
  }

  list(query = {}) {
    return this.find(this.buildFilter(query), { sort: '-createdAt' });
  }

  /** Active (pending) approvals — not yet issued or rejected. */
  listActive() {
    return this.find(
      { status: { $nin: [APPROVAL_STATUS.ISSUED, APPROVAL_STATUS.REJECTED] } },
      { sort: '-createdAt' }
    );
  }
}

module.exports = new ApprovalRepository();
