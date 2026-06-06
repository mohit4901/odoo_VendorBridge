// Purchase order line-item subdocument.
const mongoose = require('mongoose');
const { applyToJSON } = require('../../../utils/mongoose');

const poItemSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    qty: { type: Number, min: 0, default: 1 },
    price: { type: Number, min: 0, default: 0 },
  },
  { _id: true }
);

applyToJSON(poItemSchema);

module.exports = { poItemSchema };
