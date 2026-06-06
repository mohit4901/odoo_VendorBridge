// Aggregate router mounting every feature module under /api/v1.
// Modules are loaded resiliently: if a module isn't implemented yet, the server still boots
// and logs a warning instead of crashing (handy during incremental development).
const express = require('express');
const logger = require('../utils/logger');

const router = express.Router();

const MODULES = [
  { path: '/auth', loader: () => require('../modules/auth/routes/auth.routes') },
  { path: '/users', loader: () => require('../modules/users/routes/user.routes') },
  { path: '/vendors', loader: () => require('../modules/vendors/routes/vendor.routes') },
  { path: '/rfqs', loader: () => require('../modules/rfqs/routes/rfq.routes') },
  { path: '/quotations', loader: () => require('../modules/quotations/routes/quotation.routes') },
  { path: '/approvals', loader: () => require('../modules/approvals/routes/approval.routes') },
  { path: '/purchase-orders', loader: () => require('../modules/purchaseOrders/routes/po.routes') },
  { path: '/invoices', loader: () => require('../modules/invoices/routes/invoice.routes') },
  { path: '/notifications', loader: () => require('../modules/notifications/routes/notification.routes') },
  { path: '/activity-logs', loader: () => require('../modules/activityLogs/routes/activityLog.routes') },
  { path: '/dashboard', loader: () => require('../modules/dashboard/routes/dashboard.routes') },
  { path: '/reports', loader: () => require('../modules/reports/routes/report.routes') },
];

const mounted = [];
for (const mod of MODULES) {
  try {
    const moduleRouter = mod.loader();
    // A real Express router is a function; blueprint stubs export {} / undefined.
    if (typeof moduleRouter !== 'function') {
      logger.warn(`Module not yet implemented (no router exported), skipping: /api/v1${mod.path}`);
      continue;
    }
    router.use(mod.path, moduleRouter);
    mounted.push(mod.path);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      logger.warn(`Module not yet implemented, skipping mount: /api/v1${mod.path}`);
    } else {
      logger.error(`Failed to mount /api/v1${mod.path}:`, err.message);
      throw err;
    }
  }
}

// API index — lists what is currently live.
router.get('/', (_req, res) =>
  res.json({ success: true, message: 'VendorBridge API v1', data: { mounted } })
);

logger.info(`Mounted API modules: ${mounted.join(', ') || '(none)'}`);

module.exports = router;
