// User — the authentication principal. Roles are lowercase to match the frontend.
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLE_VALUES, ROLES } = require('../../../constants/roles.constants');
const { applyToJSON } = require('../../../utils/mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.VENDOR },
    company: { type: String, trim: true, default: 'VendorBridge Corp' },
    phone: { type: String, trim: true },
    // Link to the Vendor profile when this user is a vendor principal.
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

applyToJSON(userSchema);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.index({ role: 1 });
userSchema.index({ vendorId: 1 });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
