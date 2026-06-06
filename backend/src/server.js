// Application entrypoint: connect DB → seed (optional) → start HTTP server → schedule jobs.
const app = require('./app');
const config = require('./config/env');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/db/db.config');

let server;

const start = async () => {
  try {
    config.assertSecretsForProd();
    await connectDB();

    // Seed demo data on first boot (when enabled and the DB is empty).
    if (config.seedOnStart) {
      try {
        const { seedDatabase } = require('./seed/seedData');
        await seedDatabase({ onlyIfEmpty: true });
      } catch (err) {
        logger.warn('Seeding skipped:', err.message);
      }
    }

    // Background reminder crons (RFQ deadlines, invoice due dates).
    try {
      const { initJobs } = require('./jobs/reminderJobs');
      initJobs();
    } catch (err) {
      logger.warn('Background jobs not started:', err.message);
    }

    server = app.listen(config.port, () => {
      logger.success(`VendorBridge API listening on http://localhost:${config.port} (${config.env})`);
      logger.info(`API base: http://localhost:${config.port}/api/v1`);
    });
  } catch (err) {
    logger.error('Fatal startup error:', err.message);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.warn(`${signal} received — shutting down gracefully...`);
  if (server) server.close();
  try {
    await disconnectDB();
  } catch {
    /* noop */
  }
  process.exit(0);
};

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection:', reason));

start();

module.exports = { app, start };
