// Central environment loader. Loads .env once and exposes a typed, defaulted config object.
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const toBool = (v, fallback = false) =>
  v === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());

const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  mongoUri: process.env.MONGODB_URI || '',
  seedOnStart: toBool(process.env.SEED_ON_START, true),

  jwt: {
    secret: process.env.JWT_SECRET || 'change_me_super_secret_dev_key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },
  cookieSecret: process.env.COOKIE_SECRET || 'change_me_cookie_secret',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    get enabled() {
      return Boolean(this.cloudName && this.apiKey && this.apiSecret);
    },
  },

  mail: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'VendorBridge <no-reply@vendorbridge.com>',
    get enabled() {
      return Boolean(this.user && this.pass);
    },
  },

  invoice: {
    taxRate: parseFloat(process.env.INVOICE_TAX_RATE) || 0.18,
    dueDays: parseInt(process.env.INVOICE_DUE_DAYS, 10) || 30,
  },
};

const DEFAULT_JWT_SECRET = 'change_me_super_secret_dev_key';
const DEFAULT_COOKIE_SECRET = 'change_me_cookie_secret';

/**
 * Fail fast in production if security-critical secrets are missing or still set to their
 * well-known development placeholders. No-op in non-production environments.
 */
config.assertSecretsForProd = () => {
  if (!config.isProd) return;
  const bad = [];
  if (!process.env.JWT_SECRET || config.jwt.secret === DEFAULT_JWT_SECRET) bad.push('JWT_SECRET');
  if (!process.env.COOKIE_SECRET || config.cookieSecret === DEFAULT_COOKIE_SECRET) bad.push('COOKIE_SECRET');
  if (bad.length) {
    throw new Error(
      `Refusing to start in production with missing/default secrets: ${bad.join(', ')}. ` +
        'Set strong unique values in the environment.'
    );
  }
};

module.exports = config;
