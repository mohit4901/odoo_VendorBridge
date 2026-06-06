// Vendor — supplier directory record. Field names match the frontend (name, category, slaScore, status).
const mongoose = require('mongoose');
const { VENDOR_STATUS, VENDOR_CATEGORY } = require('../../../enums/status.enums');
const { applyToJSON } = require('../../../utils/mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Vendor name is required'], trim: true },
    category: { type: String, enum: VENDOR_CATEGORY, default: 'Office Furniture' },
    contactPerson: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    // SLA / performance rating shown on the vendor card (0–100).
    slaScore: { type: Number, min: 0, max: 100, default: 80 },
    status: { type: String, enum: Object.values(VENDOR_STATUS), default: VENDOR_STATUS.PENDING },
    gstNumber: { type: String, trim: true, default: '' },
    // Optional link to the auth user that owns this vendor profile.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

vendorSchema.index({ name: 'text', category: 'text', contactPerson: 'text' });

applyToJSON(vendorSchema);

vendorSchema.index({ status: 1 });
vendorSchema.index({ userId: 1 }, { sparse: true });

module.exports = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
