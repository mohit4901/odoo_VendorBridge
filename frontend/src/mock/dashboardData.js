export const mockDashboardMetrics = [
  {
    title: 'Total Procurement Spend',
    value: '$2,458,900',
    trend: '+12.4%',
    trendType: 'positive',
    timeframe: 'vs last month',
    metricKey: 'spend'
  },
  {
    title: 'Onboarded Vendors',
    value: '142',
    trend: '+8.2%',
    trendType: 'positive',
    timeframe: 'vs last quarter',
    metricKey: 'vendors'
  },
  {
    title: 'Active RFQs',
    value: '38',
    trend: '+4.5%',
    trendType: 'positive',
    timeframe: 'active negotiations',
    metricKey: 'rfqs'
  },
  {
    title: 'Compliance Rating',
    value: '98.6%',
    trend: '+0.4%',
    trendType: 'positive',
    timeframe: 'SLA matching rate',
    metricKey: 'compliance'
  }
];

export const mockSpendingChartData = [
  { month: 'Jan', Direct: 120000, Indirect: 85000, Services: 60000 },
  { month: 'Feb', Direct: 140000, Indirect: 95000, Services: 68000 },
  { month: 'Mar', Direct: 190000, Indirect: 110000, Services: 75000 },
  { month: 'Apr', Direct: 165000, Indirect: 115000, Services: 82000 },
  { month: 'May', Direct: 210000, Indirect: 130000, Services: 90000 },
  { month: 'Jun', Direct: 250000, Indirect: 145000, Services: 105000 }
];

export const mockRfqStatusData = [
  { name: 'Draft', value: 5, color: '#4b5563' },
  { name: 'Sent', value: 12, color: '#06b6d4' },
  { name: 'Under Review', value: 15, color: '#f59e0b' },
  { name: 'Closed & Awarded', value: 6, color: '#10b981' }
];

export const mockRecentActivities = [
  {
    id: 1,
    type: 'rfq',
    title: 'RFQ #2026-004 Published',
    desc: 'Lithium battery cells purchase request dispatched to 5 suppliers.',
    time: '2 hours ago',
    user: 'M. Mudgil'
  },
  {
    id: 2,
    type: 'vendor',
    title: 'New Vendor Registered',
    desc: 'Zenith Energy Solutions completed self-onboarding documentation.',
    time: '5 hours ago',
    user: 'System Bot'
  },
  {
    id: 3,
    type: 'invoice',
    title: 'Invoice Approved',
    desc: 'Invoice INV-2026-9801 ($45,200) approved by Finance Manager.',
    time: '1 day ago',
    user: 'A. Sharma'
  },
  {
    id: 4,
    type: 'po',
    title: 'Purchase Order Issued',
    desc: 'PO #8843 for structural steel ($120,000) sent to Apex Metals.',
    time: '2 days ago',
    user: 'K. Patel'
  }
];

export const mockPendingApprovals = [
  {
    id: 1,
    title: 'Purchase Order PO-2026-112',
    desc: 'Supplier: Apex Metals | Amount: $89,200',
    dueDate: 'Action Required Today',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Verify Vendor Compliance Document',
    desc: 'Supplier: Zenith Energy | Tax Exemption Certificate',
    dueDate: 'Due in 2 days',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Review RFQ Quotation Comparison',
    desc: 'RFQ-2026-003: Raw Lithium Carbonate',
    dueDate: 'Due in 3 days',
    priority: 'low'
  }
];
