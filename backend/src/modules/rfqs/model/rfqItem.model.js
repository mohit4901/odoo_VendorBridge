// RFQ line-item subdocument schema (embedded in RFQ.items). Each item gets its own id.
const mongoose = require('mongoose');
const { UOM } = require('../../../enums/status.enums');
const { applyToJSON } = require('../../../utils/mongoose');

const rfqItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 0, default: 1 },
    uom: { type: String, default: 'Units' }, // tolerant: 'Units','Tons','NOS','Liters','Kilograms'...
  },
  { _id: true }
);

applyToJSON(rfqItemSchema);

module.exports = { rfqItemSchema, UOM };
