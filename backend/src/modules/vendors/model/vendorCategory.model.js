// VendorCategory — optional managed list of procurement categories (for admin config / dropdowns).
const mongoose = require('mongoose');
const { applyToJSON } = require('../../../utils/mongoose');

const vendorCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

applyToJSON(vendorCategorySchema);

module.exports = mongoose.models.VendorCategory || mongoose.model('VendorCategory', vendorCategorySchema);
