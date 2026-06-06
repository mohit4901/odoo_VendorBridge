// Profile — optional extended account details for a User (one-to-one). Owned by the users module.
const mongoose = require('mongoose');
const { applyToJSON } = require('../../../utils/mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      unique: true,
    },
    department: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    avatar: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

applyToJSON(profileSchema);

module.exports = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
