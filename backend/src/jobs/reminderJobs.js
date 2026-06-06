// Scheduled reminders: invoice due-date alerts and RFQ deadline alerts.
// Each job is defensive — it lazy-resolves models at run time and never throws into the scheduler.
const cron = require('node-cron');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { INVOICE_STATUS, RFQ_STATUS, NOTIFICATION_TYPE, ACTIVITY_TYPE } = require('../enums/status.enums');

// Date fields (dueDate/deliveryDate) are stored as 'YYYY-MM-DD' strings, so compare against a
// like-typed string (lexicographically correct for ISO dates).
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const safeModel = (name) => {
  try {
    return mongoose.model(name);
  } catch {
    return null;
  }
};

const notify = async (title, type = NOTIFICATION_TYPE.WARNING) => {
  const Notification = safeModel('Notification');
  if (Notification) await Notification.create({ title, type, read: false }).catch(() => {});
};

const audit = async (title, desc, type = ACTIVITY_TYPE.SYSTEM) => {
  const ActivityLog = safeModel('ActivityLog');
  if (ActivityLog) await ActivityLog.create({ title, desc, type, user: 'System Bot' }).catch(() => {});
};

const checkInvoicesDue = async () => {
  const Invoice = safeModel('Invoice');
  if (!Invoice) return;
  const soon = daysFromNow(3);
  const due = await Invoice.find({
    status: INVOICE_STATUS.PENDING,
    dueDate: { $lte: soon },
  }).catch(() => []);
  for (const inv of due) {
    await notify(`Invoice ${inv.invoiceRef} is due soon (${inv.dueDate})`, NOTIFICATION_TYPE.WARNING);
  }
  if (due.length) await audit('Invoice Reminders', `${due.length} invoice(s) approaching due date.`, ACTIVITY_TYPE.INVOICE);
};

const checkRfqDeadlines = async () => {
  const RFQ = safeModel('RFQ');
  if (!RFQ) return;
  const soon = daysFromNow(2);
  const open = await RFQ.find({
    status: { $in: [RFQ_STATUS.SENT, RFQ_STATUS.UNDER_REVIEW] },
    deliveryDate: { $lte: soon },
  }).catch(() => []);
  for (const rfq of open) {
    await notify(`RFQ "${rfq.title}" deadline is approaching (${rfq.deliveryDate})`, NOTIFICATION_TYPE.INFO);
  }
};

/** Register cron schedules. Disabled automatically if node-cron is unavailable. */
const initJobs = () => {
  // Daily at 09:00 server time.
  cron.schedule('0 9 * * *', () => {
    checkInvoicesDue().catch((e) => logger.warn('invoice reminder job failed:', e.message));
    checkRfqDeadlines().catch((e) => logger.warn('rfq reminder job failed:', e.message));
  });
  logger.info('Reminder jobs scheduled (daily 09:00).');
};

module.exports = { initJobs, checkInvoicesDue, checkRfqDeadlines };
