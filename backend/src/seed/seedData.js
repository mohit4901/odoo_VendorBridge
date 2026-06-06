// Demo data seeder. Mirrors the frontend mock datasets so a wired UI shows familiar records.
// Defensive: only seeds collections whose models are registered (skips not-yet-built modules).
// Run standalone:  npm run seed         (resets and seeds everything)
// On boot:         seedDatabase({ onlyIfEmpty: true })
const path = require('path');
const logger = require('../utils/logger');

const tryRequire = (rel) => {
  try {
    const m = require(rel);
    return m && m.modelName ? m : null; // a real Mongoose model has .modelName
  } catch {
    return null;
  }
};

const getModels = () => ({
  User: tryRequire('../modules/auth/model/user.model'),
  Vendor: tryRequire('../modules/vendors/model/vendor.model'),
  RFQ: tryRequire('../modules/rfqs/model/rfq.model'),
  Quotation: tryRequire('../modules/quotations/model/quotation.model'),
  Approval: tryRequire('../modules/approvals/model/approvalWorkflow.model'),
  PurchaseOrder: tryRequire('../modules/purchaseOrders/model/purchaseOrder.model'),
  Invoice: tryRequire('../modules/invoices/model/invoice.model'),
  Notification: tryRequire('../modules/notifications/model/notification.model'),
  ActivityLog: tryRequire('../modules/activityLogs/model/activityLog.model'),
});

// ── Source data (mirrors frontend/src/mock + context seeds) ───────────────────
const USERS = [
  { name: 'Global Administrator', email: 'admin@vendorbridge.com', password: 'admin123', role: 'admin', company: 'VendorBridge Corp' },
  { name: 'Priya Sharma', email: 'officer@vendorbridge.com', password: 'officer123', role: 'officer', company: 'VendorBridge Corp' },
  { name: 'A. Sharma', email: 'manager@vendorbridge.com', password: 'manager123', role: 'manager', company: 'VendorBridge Corp' },
  { name: 'Apex Supplies Ltd.', email: 'vendor@vendorbridge.com', password: 'vendor123', role: 'vendor', company: 'Apex Supplies Ltd.' },
];

const VENDORS = [
  { name: 'Apex Supplies Ltd.', category: 'Office Furniture', contactPerson: 'Jane Doe', email: 'jdoe@apexsupplies.com', phone: '+1 (555) 019-2834', slaScore: 95, status: 'Active' },
  { name: 'Zenith Energy Solutions', category: 'Electronics', contactPerson: 'David Miller', email: 'd.miller@zenithenergy.com', phone: '+1 (555) 024-9102', slaScore: 88, status: 'Active' },
  { name: 'Nexus Logistics Corp', category: 'Logistics', contactPerson: 'Sarah Jenkins', email: 'sjenkins@nexuslogistics.com', phone: '+1 (555) 039-4481', slaScore: 92, status: 'Active' },
  { name: 'Apex Metals Inc.', category: 'Raw Materials', contactPerson: 'Karan Patel', email: 'kpatel@apexmetals.com', phone: '+1 (555) 084-2918', slaScore: 78, status: 'Pending' },
  { name: 'Cyber Solutions Group', category: 'IT Services', contactPerson: 'Elena Rostova', email: 'erostova@cybersolutions.com', phone: '+1 (555) 092-1102', slaScore: 96, status: 'Active' },
  { name: 'Titan Freight Services', category: 'Logistics', contactPerson: 'Marcus Vance', email: 'mvance@titanfreight.net', phone: '+1 (555) 041-3829', slaScore: 54, status: 'Blacklisted' },
];

const NOTIFICATIONS = [
  { title: 'PO #8845 requires approval', type: 'warning', read: false },
  { title: 'Zenith Energy submitted quotation', type: 'info', read: false },
  { title: 'Compliance doc verified for Apex Metals', type: 'success', read: false },
];

const ACTIVITY_LOGS = [
  { type: 'rfq', title: 'RFQ #2026-004 Published', desc: 'Lithium battery cells purchase request dispatched to 5 suppliers.', user: 'M. Mudgil' },
  { type: 'vendor', title: 'New Vendor Registered', desc: 'Zenith Energy Solutions completed self-onboarding documentation.', user: 'System Bot' },
  { type: 'invoice', title: 'Invoice Approved', desc: 'Invoice INV-2026-9801 ($45,200) approved by Finance Manager.', user: 'A. Sharma' },
  { type: 'po', title: 'Purchase Order Issued', desc: 'PO #8843 for structural steel ($120,000) sent to Apex Metals.', user: 'K. Patel' },
];

const clearAll = async (models) => {
  for (const m of Object.values(models)) {
    if (m) await m.deleteMany({});
  }
};

/**
 * @param {{onlyIfEmpty?:boolean, reset?:boolean}} opts
 */
const seedDatabase = async (opts = {}) => {
  const { onlyIfEmpty = false, reset = false } = opts;
  const models = getModels();
  const { User, Vendor, RFQ, Quotation, Approval, PurchaseOrder, Invoice, Notification, ActivityLog } = models;

  if (!User) {
    logger.warn('Seed: User model unavailable — skipping.');
    return { skipped: true };
  }

  if (onlyIfEmpty) {
    const count = await User.countDocuments();
    if (count > 0) {
      logger.info('Seed: database already populated — skipping (onlyIfEmpty).');
      return { skipped: true };
    }
  }

  if (reset) await clearAll(models);

  // Users (create() triggers password hashing).
  const users = [];
  for (const u of USERS) users.push(await User.create(u));
  logger.success(`Seeded ${users.length} users.`);

  // Vendors
  const vendorDocs = await Vendor.insertMany(VENDORS);
  const vByName = Object.fromEntries(vendorDocs.map((v) => [v.name, v]));
  logger.success(`Seeded ${vendorDocs.length} vendors.`);

  // Link the demo vendor account to its vendor profile (enables ownership checks on quotations).
  const vendorUser = users.find((u) => u.role === 'vendor');
  const apex = vByName['Apex Supplies Ltd.'];
  if (vendorUser && apex) {
    vendorUser.vendorId = apex._id;
    await vendorUser.save({ validateBeforeSave: false });
    apex.userId = vendorUser._id;
    await apex.save();
  }

  let rfqDocs = [];
  if (RFQ) {
    rfqDocs = await RFQ.create([
      {
        rfqNumber: 'RFQ-2026-001',
        title: 'Office Furniture Procurement',
        category: 'Office Furniture',
        deliveryDate: '2026-06-25',
        description: 'Procurement of ergonomic mesh office chairs and dual-motor standing desks for the Delhi office expansion.',
        status: 'Sent',
        vendorIds: [vByName['Apex Supplies Ltd.']._id, vByName['Zenith Energy Solutions']._id, vByName['Cyber Solutions Group']._id],
        items: [
          { name: 'Ergonomic Office Chair', qty: 50, uom: 'Units' },
          { name: 'Standing Desk (Dual Motor)', qty: 25, uom: 'Units' },
        ],
        createdBy: 'Priya Sharma',
      },
      {
        rfqNumber: 'RFQ-2026-002',
        title: 'Raw Lithium Carbonate Supply',
        category: 'Raw Materials',
        deliveryDate: '2026-07-15',
        description: 'Battery-grade lithium carbonate (Li2CO3, 99.5% purity) for research and cell fabrication.',
        status: 'Under Review',
        vendorIds: [vByName['Zenith Energy Solutions']._id, vByName['Apex Metals Inc.']._id],
        items: [{ name: 'Lithium Carbonate Powder', qty: 10, uom: 'Tons' }],
        createdBy: 'Priya Sharma',
      },
    ]);
    logger.success(`Seeded ${rfqDocs.length} RFQs.`);
  }

  if (Quotation && rfqDocs.length) {
    const rfq1 = rfqDocs[0];
    const rfq2 = rfqDocs[1];
    const itemRef = (rfq, idx, unitPrice) => ({
      rfqItemId: rfq.items[idx]._id,
      name: rfq.items[idx].name,
      qty: rfq.items[idx].qty,
      unitPrice,
    });
    await Quotation.create([
      {
        rfqId: rfq1._id, vendorId: vByName['Apex Supplies Ltd.']._id, vendorName: 'Apex Supplies Ltd.', slaScore: 95,
        deliveryTime: '10 days', terms: '30 days net payment. Free shipping.', validityDate: '2026-07-05',
        items: [itemRef(rfq1, 0, 150), itemRef(rfq1, 1, 350)], totalBid: 16250,
      },
      {
        rfqId: rfq1._id, vendorId: vByName['Cyber Solutions Group']._id, vendorName: 'Cyber Solutions Group', slaScore: 96,
        deliveryTime: '7 days', terms: '15 days net. Shipping $500 extra.', validityDate: '2026-07-10',
        items: [itemRef(rfq1, 0, 165), itemRef(rfq1, 1, 320)], totalBid: 16250,
      },
      {
        rfqId: rfq2._id, vendorId: vByName['Apex Metals Inc.']._id, vendorName: 'Apex Metals Inc.', slaScore: 78,
        deliveryTime: '14 days', terms: '50% advance, 50% on delivery.', validityDate: '2026-06-30',
        items: [itemRef(rfq2, 0, 12500)], totalBid: 125000,
      },
      {
        rfqId: rfq2._id, vendorId: vByName['Zenith Energy Solutions']._id, vendorName: 'Zenith Energy Solutions', slaScore: 88,
        deliveryTime: '20 days', terms: 'Net 45. Standard warranty applies.', validityDate: '2026-07-01',
        items: [itemRef(rfq2, 0, 11800)], totalBid: 118000,
      },
    ]);
    logger.success('Seeded 4 quotations.');
  }

  if (Approval && rfqDocs.length) {
    await Approval.create([
      {
        rfqId: rfqDocs[0]._id, rfqTitle: 'Office Furniture Procurement', vendorId: vByName['Apex Supplies Ltd.']._id,
        vendorName: 'Apex Supplies Ltd.', amount: 16250, status: 'Manager Review',
        history: [
          { step: 'Draft Generated', user: 'System Bot', comment: 'RFQ awarded.' },
          { step: 'Submitted for Review', user: 'Jane Doe', comment: 'Forwarded to Manager approval node.' },
        ],
        items: [
          { name: 'Ergonomic Office Chair', qty: 50, price: 150 },
          { name: 'Standing Desk (Dual Motor)', qty: 25, price: 350 },
        ],
      },
      {
        rfqId: rfqDocs[1]._id, rfqTitle: 'Raw Lithium Carbonate Supply', vendorId: vByName['Zenith Energy Solutions']._id,
        vendorName: 'Zenith Energy Solutions', amount: 118000, status: 'Manager Review',
        history: [
          { step: 'Draft Generated', user: 'System Bot', comment: 'RFQ awarded.' },
          { step: 'Submitted for Review', user: 'David Miller', comment: 'Forwarded to Manager approval node.' },
        ],
        items: [{ name: 'Lithium Carbonate Powder', qty: 10, price: 11800 }],
      },
    ]);
    logger.success('Seeded 2 approval workflows.');
  }

  let poDocs = [];
  if (PurchaseOrder) {
    poDocs = await PurchaseOrder.create([
      {
        poRef: 'PO-2026-8843', rfqTitle: 'Structural Steel Columns', vendorName: 'Apex Metals Inc.',
        amount: 120000, status: 'Issued', date: '2026-06-04',
        items: [{ name: 'Structural Steel H-Beams', qty: 100, price: 1200 }],
      },
    ]);
    logger.success(`Seeded ${poDocs.length} purchase orders.`);
  }

  if (Invoice) {
    await Invoice.create([
      {
        invoiceRef: 'INV-2026-8843', poRef: 'PO-2026-8843', vendorName: 'Apex Metals Inc.',
        subtotal: 120000, tax: 21600, total: 141600, status: 'Pending Payment',
        date: '2026-06-04', dueDate: '2026-07-04',
        items: [{ name: 'Structural Steel H-Beams', qty: 100, price: 1200 }],
      },
    ]);
    logger.success('Seeded 1 invoice.');
  }

  if (Notification) {
    await Notification.insertMany(NOTIFICATIONS);
    logger.success(`Seeded ${NOTIFICATIONS.length} notifications.`);
  }
  if (ActivityLog) {
    await ActivityLog.insertMany(ACTIVITY_LOGS);
    logger.success(`Seeded ${ACTIVITY_LOGS.length} activity logs.`);
  }

  logger.success('✔ Seeding complete.');
  return { skipped: false };
};

module.exports = { seedDatabase, USERS, VENDORS };

// CLI entrypoint: `npm run seed`
if (require.main === module) {
  /* eslint-disable global-require */
  const { connectDB, disconnectDB } = require('../config/db/db.config');
  (async () => {
    try {
      await connectDB();
      // Ensure every model is registered before seeding, even if its routes aren't mounted.
      ['../modules/auth/model/user.model', '../modules/vendors/model/vendor.model', '../modules/rfqs/model/rfq.model',
        '../modules/quotations/model/quotation.model', '../modules/approvals/model/approvalWorkflow.model',
        '../modules/purchaseOrders/model/purchaseOrder.model', '../modules/invoices/model/invoice.model',
        '../modules/notifications/model/notification.model', '../modules/activityLogs/model/activityLog.model',
      ].forEach((p) => { try { require(p); } catch { /* not built yet */ } });

      await seedDatabase({ reset: true });
      await disconnectDB();
      logger.success('Seed CLI finished.');
      process.exit(0);
    } catch (err) {
      logger.error('Seed CLI failed:', err.message);
      process.exit(1);
    }
  })();
}
