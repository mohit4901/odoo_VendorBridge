// Optional explicit RFQ→Vendor invitation ledger. The primary assignment lives in RFQ.vendorIds;
// this collection records the invite event/status when a finer audit of invitations is wanted.
const mongoose = require('mongoose');
const { applyToJSON } = require('../../../utils/mongoose');

const rfqVendorAssignmentSchema = new mongoose.Schema(
  {
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    status: { type: String, default: 'Invited' }, // Invited | Responded | Declined
  },
  { timestamps: true }
);

rfqVendorAssignmentSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });
applyToJSON(rfqVendorAssignmentSchema);

module.exports =
  mongoose.models.RfqVendorAssignment || mongoose.model('RfqVendorAssignment', rfqVendorAssignmentSchema);
