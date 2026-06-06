// Cloudinary object storage for RFQ attachments. Degrades gracefully when not configured:
// uploads then return a deterministic placeholder URL so the request still succeeds in dev/demo.
const { v2: cloudinary } = require('cloudinary');
const config = require('../env');
const logger = require('../../utils/logger');

if (config.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  logger.info('Cloudinary configured for attachment uploads.');
} else {
  logger.warn('Cloudinary not configured — attachment uploads will return placeholder URLs.');
}

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {object} opts { folder, filename }
 * @returns {Promise<{ url:string, publicId:string|null, mock:boolean }>}
 */
const uploadBuffer = (buffer, { folder = 'vendorbridge', filename = 'file' } = {}) =>
  new Promise((resolve, reject) => {
    if (!config.cloudinary.enabled) {
      return resolve({
        url: `https://placeholder.vendorbridge.local/${folder}/${encodeURIComponent(filename)}`,
        publicId: null,
        mock: true,
      });
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', public_id: filename.replace(/\.[^.]+$/, '') },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id, mock: false });
      }
    );
    stream.end(buffer);
  });

module.exports = { cloudinary, uploadBuffer, isEnabled: () => config.cloudinary.enabled };
