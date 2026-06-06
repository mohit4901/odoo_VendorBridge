// Quotation — a vendor's bid against an RFQ.
const mongoose = require('mongoose');
const { applyToJSON } = require('../../../utils/mongoose');
const { quotationItemSchema } = require('./quotationItem.model');

const QUOTE_STATUS = ['Submitted', 'Awarded', 'Rejected'];

const quotationSchema = new mongoose.Schema(
  {
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    vendorName: { type: String, trim: true },
    slaScore: { type: Number, min: 0, max: 100, default: 80 },
    deliveryTime: { type: String, default: '' }, // e.g. '10 days'
    terms: { type: String, default: '' },
    validityDate: { type: String, default: '' }, // 'YYYY-MM-DD'
    items: { type: [quotationItemSchema], default: [] },
    totalBid: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: QUOTE_STATUS, default: 'Submitted' },
  },
  { timestamps: true }
);

applyToJSON(quotationSchema);

quotationSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });
quotationSchema.index({ vendorId: 1 });
quotationSchema.index({ status: 1 });

module.exports = mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);
module.exports.QUOTE_STATUS = QUOTE_STATUS;
