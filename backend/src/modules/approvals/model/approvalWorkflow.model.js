// Approval — the serial approval workflow for an awarded quotation (Manager → Finance → Issued).
const mongoose = require('mongoose');
const { APPROVAL_STATUS, values } = require('../../../enums/status.enums');
const { applyToJSON } = require('../../../utils/mongoose');
const { approvalHistorySchema, approvalItemSchema } = require('./approvalStage.model');

const approvalSchema = new mongoose.Schema(
  {
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ' },
    rfqTitle: { type: String, trim: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    vendorName: { type: String, trim: true },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
    amount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: values(APPROVAL_STATUS), default: APPROVAL_STATUS.MANAGER_REVIEW },
    history: { type: [approvalHistorySchema], default: [] },
    items: { type: [approvalItemSchema], default: [] },
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', default: null },
  },
  { timestamps: true }
);

applyToJSON(approvalSchema);

module.exports = mongoose.models.Approval || mongoose.model('Approval', approvalSchema);
