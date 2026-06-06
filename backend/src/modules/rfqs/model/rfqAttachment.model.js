// RFQ attachment subdocument schema (embedded in RFQ.attachments). Populated by Cloudinary uploads.
const mongoose = require('mongoose');
const { applyToJSON } = require('../../../utils/mongoose');

const rfqAttachmentSchema = new mongoose.Schema(
  {
    fileName: { type: String, trim: true },
    url: { type: String, trim: true },
    publicId: { type: String, default: null },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: true, timestamps: true }
);

applyToJSON(rfqAttachmentSchema);

module.exports = { rfqAttachmentSchema };
