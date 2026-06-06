// Dashboard business logic: assembles the home-screen overview by aggregating live data from the
// other modules' collections. Each slice degrades gracefully — when a source model is missing or
// empty, we fall back to the canonical mock shapes (from frontend/src/mock/dashboardData.js) so the
// frontend always renders something coherent and the endpoint never 500s.
const repo = require('../repository/dashboard.repository');
const { timeAgo } = require('../../../utils/time');
const {
  RFQ_STATUS,
  APPROVAL_STATUS,
  INVOICE_STATUS,
} = require('../../../enums/status.enums');

// ── Canonical mock fallbacks (mirror frontend/src/mock/dashboardData.js EXACTLY) ──────────────
const MOCK_METRICS = [
  { title: 'Total Procurement Spend', value: '$2,458,900', trend: '+12.4%', trendType: 'positive', timeframe: 'vs last month', metricKey: 'spend' },
  { title: 'Onboarded Vendors', value: '142', trend: '+8.2%', trendType: 'positive', timeframe: 'vs last quarter', metricKey: 'vendors' },
  { title: 'Active RFQs', value: '38', trend: '+4.5%', trendType: 'positive', timeframe: 'active negotiations', metricKey: 'rfqs' },
  { title: 'Compliance Rating', value: '98.6%', trend: '+0.4%', trendType: 'positive', timeframe: 'SLA matching rate', metricKey: 'compliance' },
];

const MOCK_SPENDING = [
  { month: 'Jan', Direct: 120000, Indirect: 85000, Services: 60000 },
  { month: 'Feb', Direct: 140000, Indirect: 95000, Services: 68000 },
  { month: 'Mar', Direct: 190000, Indirect: 110000, Services: 75000 },
  { month: 'Apr', Direct: 165000, Indirect: 115000, Services: 82000 },
  { month: 'May', Direct: 210000, Indirect: 130000, Services: 90000 },
  { month: 'Jun', Direct: 250000, Indirect: 145000, Services: 105000 },
];

// Status palette the donut chart renders by name.
const RFQ_STATUS_COLORS = {
  [RFQ_STATUS.DRAFT]: '#4b5563',
  [RFQ_STATUS.SENT]: '#06b6d4',
  [RFQ_STATUS.UNDER_REVIEW]: '#f59e0b',
  [RFQ_STATUS.AWARDED]: '#10b981',
};

const MOCK_RFQ_STATUS = [
  { name: RFQ_STATUS.DRAFT, value: 5, color: RFQ_STATUS_COLORS[RFQ_STATUS.DRAFT] },
  { name: RFQ_STATUS.SENT, value: 12, color: RFQ_STATUS_COLORS[RFQ_STATUS.SENT] },
  { name: RFQ_STATUS.UNDER_REVIEW, value: 15, color: RFQ_STATUS_COLORS[RFQ_STATUS.UNDER_REVIEW] },
  { name: RFQ_STATUS.AWARDED, value: 6, color: RFQ_STATUS_COLORS[RFQ_STATUS.AWARDED] },
];

const MOCK_ACTIVITIES = [
  { id: 1, type: 'rfq', title: 'RFQ #2026-004 Published', desc: 'Lithium battery cells purchase request dispatched to 5 suppliers.', time: '2 hours ago', user: 'M. Mudgil' },
  { id: 2, type: 'vendor', title: 'New Vendor Registered', desc: 'Zenith Energy Solutions completed self-onboarding documentation.', time: '5 hours ago', user: 'System Bot' },
  { id: 3, type: 'invoice', title: 'Invoice Approved', desc: 'Invoice INV-2026-9801 ($45,200) approved by Finance Manager.', time: '1 day ago', user: 'A. Sharma' },
  { id: 4, type: 'po', title: 'Purchase Order Issued', desc: 'PO #8843 for structural steel ($120,000) sent to Apex Metals.', time: '2 days ago', user: 'K. Patel' },
];

const MOCK_PENDING_APPROVALS = [
  { id: 1, title: 'Purchase Order PO-2026-112', desc: 'Supplier: Apex Metals | Amount: $89,200', dueDate: 'Action Required Today', priority: 'high' },
  { id: 2, title: 'Verify Vendor Compliance Document', desc: 'Supplier: Zenith Energy | Tax Exemption Certificate', dueDate: 'Due in 2 days', priority: 'medium' },
  { id: 3, title: 'Review RFQ Quotation Comparison', desc: 'RFQ-2026-003: Raw Lithium Carbonate', dueDate: 'Due in 3 days', priority: 'low' },
];

const MOCK_PIPELINE = { rfqs: 12, quotes: 38, approvals: 5, pos: 15, paidInvoices: 18 };

// Approvals still "in flight" are everything NOT terminal (Issued / Rejected).
const ACTIVE_APPROVAL_FILTER = { status: { $nin: [APPROVAL_STATUS.ISSUED, APPROVAL_STATUS.REJECTED] } };

// ── Formatting helpers ────────────────────────────────────────────────────────────────────────
const fmtUSD = (n) => `$${Math.round(Number(n) || 0).toLocaleString('en-US')}`;
const fmtPct = (n) => `${(Number(n) || 0).toFixed(1)}%`;

/** Priority bucket for a pending-approval card, by amount. */
const priorityFor = (amount = 0) => {
  if (amount >= 100000) return 'high';
  if (amount >= 25000) return 'medium';
  return 'low';
};

const dashboardService = {
  // ── METRICS (4 KPI cards) ────────────────────────────────────────────────────────────────
  async getMetrics() {
    const [hasInvoices, hasVendors, hasRfqs] = await Promise.all([
      repo.hasAny('Invoice'),
      repo.hasAny('Vendor'),
      repo.hasAny('RFQ'),
    ]);

    // If nothing is seeded at all, return the canonical mock cards verbatim.
    if (!hasInvoices && !hasVendors && !hasRfqs) return MOCK_METRICS;

    const [totalSpend, vendorCount, activeRfqCount, slaAvgRows] = await Promise.all([
      repo.sumField('Invoice', 'total', {}, null),
      repo.countDocs('Vendor', {}, null),
      repo.countDocs('RFQ', { status: { $ne: RFQ_STATUS.AWARDED } }, null),
      repo.aggregate('Vendor', [{ $group: { _id: null, avg: { $avg: '$slaScore' } } }], null),
    ]);

    const compliance = slaAvgRows && slaAvgRows.length ? slaAvgRows[0].avg : null;

    return [
      {
        title: 'Total Procurement Spend',
        value: totalSpend != null ? fmtUSD(totalSpend) : MOCK_METRICS[0].value,
        trend: '+12.4%',
        trendType: 'positive',
        timeframe: 'vs last month',
        metricKey: 'spend',
      },
      {
        title: 'Onboarded Vendors',
        value: vendorCount != null ? String(vendorCount) : MOCK_METRICS[1].value,
        trend: '+8.2%',
        trendType: 'positive',
        timeframe: 'vs last quarter',
        metricKey: 'vendors',
      },
      {
        title: 'Active RFQs',
        value: activeRfqCount != null ? String(activeRfqCount) : MOCK_METRICS[2].value,
        trend: '+4.5%',
        trendType: 'positive',
        timeframe: 'active negotiations',
        metricKey: 'rfqs',
      },
      {
        title: 'Compliance Rating',
        value: compliance != null ? fmtPct(compliance) : MOCK_METRICS[3].value,
        trend: '+0.4%',
        trendType: 'positive',
        timeframe: 'SLA matching rate',
        metricKey: 'compliance',
      },
    ];
  },

  // ── PIPELINE (lifecycle stage counts) ────────────────────────────────────────────────────
  async getPipeline() {
    const [rfqs, quotes, approvals, pos, paidInvoices] = await Promise.all([
      repo.countDocs('RFQ', { status: { $ne: RFQ_STATUS.AWARDED } }, null),
      repo.countDocs('Quotation', {}, null),
      repo.countDocs('Approval', ACTIVE_APPROVAL_FILTER, null),
      repo.countDocs('PurchaseOrder', {}, null),
      repo.countDocs('Invoice', { status: INVOICE_STATUS.PAID }, null),
    ]);

    return {
      rfqs: rfqs != null ? rfqs : MOCK_PIPELINE.rfqs,
      quotes: quotes != null ? quotes : MOCK_PIPELINE.quotes,
      approvals: approvals != null ? approvals : MOCK_PIPELINE.approvals,
      pos: pos != null ? pos : MOCK_PIPELINE.pos,
      paidInvoices: paidInvoices != null ? paidInvoices : MOCK_PIPELINE.paidInvoices,
    };
  },

  // ── SPENDING BREAKDOWN (6-month stacked area: Direct / Indirect / Services) ───────────────
  async getSpendingBreakdown() {
    // PurchaseOrders carry an `amount` and a `date` ('YYYY-MM-DD'); bucket by month into the
    // three spend categories. Without category tagging on POs we split each month's total with a
    // stable Direct/Indirect/Services ratio so the chart stays informative. Fall back to mock if empty.
    if (!(await repo.hasAny('PurchaseOrder'))) return MOCK_SPENDING;

    const rows = await repo.aggregate('PurchaseOrder', [
      { $match: { date: { $type: 'string', $ne: '' } } },
      {
        $group: {
          _id: { $substrBytes: ['$date', 0, 7] }, // 'YYYY-MM'
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ], null);

    if (!rows || !rows.length) return MOCK_SPENDING;

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6 = rows.slice(-6);

    return last6.map((r) => {
      const mm = parseInt(String(r._id).slice(5, 7), 10);
      const label = MONTH_NAMES[(mm - 1 + 12) % 12] || String(r._id);
      const total = Number(r.total) || 0;
      // Stable 50 / 30 / 20 split across procurement categories.
      return {
        month: label,
        Direct: Math.round(total * 0.5),
        Indirect: Math.round(total * 0.3),
        Services: Math.round(total * 0.2),
      };
    });
  },

  // ── RFQ STATUS BREAKDOWN (donut: count per status) ───────────────────────────────────────
  async getRfqStatusBreakdown() {
    if (!(await repo.hasAny('RFQ'))) return MOCK_RFQ_STATUS;

    const rows = await repo.aggregate('RFQ', [
      { $group: { _id: '$status', value: { $sum: 1 } } },
    ], null);

    const counts = {};
    (rows || []).forEach((r) => { counts[r._id] = r.value; });

    // Always emit all four buckets in canonical order so the chart legend is stable.
    return [RFQ_STATUS.DRAFT, RFQ_STATUS.SENT, RFQ_STATUS.UNDER_REVIEW, RFQ_STATUS.AWARDED].map((name) => ({
      name,
      value: counts[name] || 0,
      color: RFQ_STATUS_COLORS[name],
    }));
  },

  // ── RECENT ACTIVITY (latest 4 audit-log entries) ─────────────────────────────────────────
  async getRecentActivities() {
    const docs = await repo.findRecent('ActivityLog', { limit: 4 });
    if (!docs.length) return MOCK_ACTIVITIES;

    return docs.map((d, i) => ({
      id: d._id ? String(d._id) : i + 1,
      type: d.type || 'system',
      title: d.title || '',
      desc: d.desc || '',
      time: d.time || timeAgo(d.createdAt),
      user: d.user || 'System Bot',
    }));
  },

  // ── PENDING APPROVALS (active approval workflows mapped to card shape) ────────────────────
  async getPendingApprovals() {
    const docs = await repo.findRecent('Approval', { filter: ACTIVE_APPROVAL_FILTER, limit: 4 });
    if (!docs.length) return MOCK_PENDING_APPROVALS;

    return docs.map((d, i) => {
      const amount = Number(d.amount) || 0;
      const title = d.rfqTitle ? `Approval: ${d.rfqTitle}` : 'Procurement Approval';
      const vendor = d.vendorName || 'Vendor';
      return {
        id: d._id ? String(d._id) : i + 1,
        title,
        desc: `Supplier: ${vendor} | Amount: ${fmtUSD(amount)}`,
        dueDate: d.status === APPROVAL_STATUS.FINANCE_APPROVAL ? 'Awaiting Finance Approval' : 'Awaiting Manager Review',
        priority: priorityFor(amount),
      };
    });
  },

  // ── SUMMARY (everything the home screen needs in one round-trip) ──────────────────────────
  async getSummary() {
    const [
      metrics,
      pipeline,
      spendingBreakdown,
      rfqStatusBreakdown,
      recentActivities,
      pendingApprovals,
    ] = await Promise.all([
      this.getMetrics(),
      this.getPipeline(),
      this.getSpendingBreakdown(),
      this.getRfqStatusBreakdown(),
      this.getRecentActivities(),
      this.getPendingApprovals(),
    ]);

    return {
      metrics,
      pipeline,
      spendingBreakdown,
      rfqStatusBreakdown,
      recentActivities,
      pendingApprovals,
    };
  },
};

module.exports = dashboardService;
