// Express application: middleware pipeline, API mount, and error handling.
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config/env');
const apiRouter = require('./routes');
const { notFound, errorHandler } = require('./middleware/error/error.middleware');

const app = express();

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

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookieSecret));
if (!config.isProd) app.use(morgan('dev'));

// Liveness probes
app.get('/health', (_req, res) =>
  res.json({ success: true, message: 'VendorBridge API is healthy', data: { uptime: process.uptime(), env: config.env } })
);
app.get('/', (_req, res) =>
  res.json({ success: true, message: 'VendorBridge ERP API', data: { docs: '/api/v1', health: '/health' } })
);

// Versioned API
app.use('/api/v1', apiRouter);

// 404 + centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
