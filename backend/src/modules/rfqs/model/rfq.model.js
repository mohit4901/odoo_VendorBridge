// RFQ — Request for Quotation. Embeds line items + attachments and references assigned vendors.
const mongoose = require('mongoose');
const { RFQ_STATUS, values } = require('../../../enums/status.enums');
const { applyToJSON } = require('../../../utils/mongoose');
const { rfqItemSchema } = require('./rfqItem.model');
const { rfqAttachmentSchema } = require('./rfqAttachment.model');

const rfqSchema = new mongoose.Schema(
  {
    rfqNumber: { type: String, unique: true, sparse: true, trim: true },
    title: { type: String, required: [true, 'RFQ title is required'], trim: true },
    // Category is intentionally NOT a strict enum (frontend offers a superset like 'Furniture','Office Supplies').
    category: { type: String, default: 'Office Furniture', trim: true },
    deliveryDate: { type: String, default: '' }, // 'YYYY-MM-DD'
    description: { type: String, default: '' },
    status: { type: String, enum: values(RFQ_STATUS), default: RFQ_STATUS.SENT },
    vendorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    items: { type: [rfqItemSchema], default: [] },
    attachments: { type: [rfqAttachmentSchema], default: [] },
    awardedQuotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
    createdBy: { type: String, default: '' },
  },
  { timestamps: true }
);

applyToJSON(rfqSchema);

rfqSchema.index({ status: 1 });
rfqSchema.index({ vendorIds: 1 });
rfqSchema.index({ createdAt: -1 });

module.exports = mongoose.models.RFQ || mongoose.model('RFQ', rfqSchema);
