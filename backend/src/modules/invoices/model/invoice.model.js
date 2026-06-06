// Invoice — billing document generated from a Purchase Order.
const mongoose = require('mongoose');
const { INVOICE_STATUS, values } = require('../../../enums/status.enums');
const { applyToJSON } = require('../../../utils/mongoose');
const { invoiceItemSchema } = require('./invoiceItem.model');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceRef: { type: String, required: true, unique: true, trim: true }, // 'INV-2026-8843'
    poRef: { type: String, trim: true },
    poId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    vendorName: { type: String, trim: true },
    subtotal: { type: Number, min: 0, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: values(INVOICE_STATUS), default: INVOICE_STATUS.PENDING },
    date: { type: String, default: '' }, // 'YYYY-MM-DD'
    dueDate: { type: String, default: '' }, // 'YYYY-MM-DD'
    items: { type: [invoiceItemSchema], default: [] },
  },
  { timestamps: true }
);

applyToJSON(invoiceSchema);

invoiceSchema.index({ poRef: 1 }, { unique: true });
invoiceSchema.index({ status: 1 });

module.exports = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
