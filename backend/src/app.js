// Express application: middleware pipeline, API mount, and error handling.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const crypto = require('crypto');

const config = require('./config/env');
const apiRouter = require('./routes');
const { notFound, errorHandler } = require('./middleware/error/error.middleware');

const app = express();

// Disable ETag generation to prevent 304 Not Modified status codes
app.set('etag', false);

// Prevent caching globally so all API responses return 200 OK
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP off: API-only server
app.use(hpp());

// ── Request tracing ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
});

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser tools / same-origin requests (no Origin header).
      if (!origin) return cb(null, true);
      // Strict allowlist — credentials are enabled, so we must NOT reflect arbitrary origins.
      if (config.corsOrigin.includes('*') || config.corsOrigin.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

// ── Body parsing & sanitization ───────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // Strip $ and . from req.body/params/query (NoSQL injection defense)
app.use(cookieParser(config.cookieSecret));
if (!config.isProd) app.use(morgan('dev'));

// ── Liveness probes ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ success: true, message: 'VendorBridge API is healthy', data: { uptime: process.uptime(), env: config.env } })
);
app.get('/', (_req, res) =>
  res.json({ success: true, message: 'VendorBridge ERP API', data: { docs: '/api/v1', health: '/health' } })
);

// ── Versioned API ─────────────────────────────────────────────────────────────
app.use('/api/v1', apiRouter);

// ── 404 + centralized error handler (must be last) ────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
