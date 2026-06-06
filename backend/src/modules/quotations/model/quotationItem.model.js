// Quotation line-item subdocument: a unit price bid against a specific RFQ item.
const mongoose = require('mongoose');
const { applyToJSON } = require('../../../utils/mongoose');

const quotationItemSchema = new mongoose.Schema(
  {
    rfqItemId: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, trim: true },
    qty: { type: Number, min: 0, default: 1 },
    unitPrice: { type: Number, min: 0, required: true },
  },
  { _id: true }
);

// Convenience virtual for line total.
quotationItemSchema.virtual('lineTotal').get(function lineTotal() {
  return (this.qty || 0) * (this.unitPrice || 0);
});

applyToJSON(quotationItemSchema);

module.exports = { quotationItemSchema };
