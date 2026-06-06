// PurchaseOrder — issued procurement order generated from an approved workflow.
const mongoose = require('mongoose');
const { PO_STATUS, values } = require('../../../enums/status.enums');
const { applyToJSON } = require('../../../utils/mongoose');
const { poItemSchema } = require('./purchaseOrderItem.model');

const purchaseOrderSchema = new mongoose.Schema(
  {
    poRef: { type: String, required: true, unique: true, trim: true }, // 'PO-2026-8843'
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ' },
    rfqTitle: { type: String, trim: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    vendorName: { type: String, trim: true },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval' },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
    amount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: values(PO_STATUS), default: PO_STATUS.ISSUED },
    date: { type: String, default: '' }, // 'YYYY-MM-DD'
    items: { type: [poItemSchema], default: [] },
  },
  { timestamps: true }
);

applyToJSON(purchaseOrderSchema);

purchaseOrderSchema.index({ vendorId: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ approvalId: 1 }, { sparse: true });
purchaseOrderSchema.index({ quotationId: 1 }, { sparse: true });

module.exports = mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema);
