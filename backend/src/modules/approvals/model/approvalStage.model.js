// Subdocument schemas for the approval workflow: timeline history entries and line items.
const mongoose = require('mongoose');
const { applyToJSON } = require('../../../utils/mongoose');

// One transition in the approval timeline (the "stepper" history).
const approvalHistorySchema = new mongoose.Schema(
  {
    step: { type: String, required: true }, // Draft Generated | Submitted for Review | Manager Approved | Finance Approved & Issued | Rejected
    user: { type: String, default: 'System Bot' },
    time: { type: String, default: 'Just now' },
    comment: { type: String, default: '' },
  },
  { _id: true, timestamps: true }
);
applyToJSON(approvalHistorySchema);

// Line item carried through approval → PO → invoice.
const approvalItemSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    qty: { type: Number, min: 0, default: 1 },
    price: { type: Number, min: 0, default: 0 },
  },
  { _id: true }
);
applyToJSON(approvalItemSchema);

module.exports = { approvalHistorySchema, approvalItemSchema };
