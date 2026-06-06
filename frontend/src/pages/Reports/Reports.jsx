import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileQuestion, 
  ShieldCheck, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Calendar, 
  RefreshCw, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { initialVendors } from '../../mock/vendorsData';
import { initialRfqs } from '../../mock/rfqsData';
import { useNotifications } from '../../context/NotificationContext/NotificationContext';

const Reports = () => {
  const { addNotification, addAuditLog } = useNotifications();

  // Load from LocalStorage or fallbacks
  const [vendors, setVendors] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [pos, setPos] = useState([]);

  // Filter States
  const [timeframe, setTimeframe] = useState('All Time');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVendor, setSelectedVendor] = useState('All');

  // Export / Print Modal Simulators
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  useEffect(() => {
    const savedVendors = localStorage.getItem('vb_vendors');
    setVendors(savedVendors ? JSON.parse(savedVendors) : initialVendors);

    const savedRfqs = localStorage.getItem('vb_rfqs');
    setRfqs(savedRfqs ? JSON.parse(savedRfqs) : initialRfqs);

    const savedInvoices = localStorage.getItem('vb_invoices');
    setInvoices(savedInvoices ? JSON.parse(savedInvoices) : []);

    const savedPos = localStorage.getItem('vb_pos');
    setPos(savedPos ? JSON.parse(savedPos) : []);
  }, []);

  // Compute stats
  const dynamicInvoiceSpend = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const baseSpend = 2458900;
  const totalSpend = baseSpend + dynamicInvoiceSpend;

  const currentVendors = vendors.length > 0 ? vendors : initialVendors;
  const avgSla = currentVendors.length > 0 
    ? Math.round(currentVendors.reduce((sum, v) => sum + v.slaScore, 0) / currentVendors.length)
    : 85;

  const currentRfqs = rfqs.length > 0 ? rfqs : initialRfqs;
  const closedRfqsCount = currentRfqs.filter(r => r.status === 'Closed & Awarded').length;
  // Let's add baseline rates
  const rfqConversionRate = currentRfqs.length > 0 
    ? Math.round(((closedRfqsCount + 11) / (currentRfqs.length + 15)) * 100) 
    : 72;

  // Custom colors for charts
  const COLORS = ['#06b6d4', '#6366f1', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];

  // Spending data preparation (Category comparison trend)
  const baseSpendData = [
    { month: 'Jan', 'Raw Materials': 120000, Electronics: 85000, 'Office Furniture': 60000, Logistics: 45000, 'IT Services': 30000 },
    { month: 'Feb', 'Raw Materials': 140000, Electronics: 95000, 'Office Furniture': 68000, Logistics: 50000, 'IT Services': 32000 },
    { month: 'Mar', 'Raw Materials': 190000, Electronics: 110000, 'Office Furniture': 75000, Logistics: 55000, 'IT Services': 35000 },
    { month: 'Apr', 'Raw Materials': 165000, Electronics: 115000, 'Office Furniture': 82000, Logistics: 58000, 'IT Services': 40000 },
    { month: 'May', 'Raw Materials': 210000, Electronics: 130000, 'Office Furniture': 90000, Logistics: 65000, 'IT Services': 42000 },
    { month: 'Jun', 'Raw Materials': 250000, Electronics: 145000, 'Office Furniture': 105000, Logistics: 70000, 'IT Services': 45000 }
  ];

  // Dynamic spending addition from paid/pending invoices
  const prepareSpendingChartData = () => {
    // If category filter is applied, we adjust the values
    let chartData = [...baseSpendData];
    
    // Add dynamic invoices to June
    if (invoices.length > 0) {
      chartData = chartData.map((data, idx) => {
        if (idx === chartData.length - 1) { // Add to latest month
          const updated = { ...data };
          invoices.forEach(inv => {
            // map invoice back to vendor category
            const vendor = currentVendors.find(v => v.name === inv.vendorName);
            const cat = vendor ? vendor.category : 'Raw Materials';
            if (updated[cat] !== undefined) {
              updated[cat] += inv.total;
            } else {
              updated[cat] = inv.total;
            }
          });
          return updated;
        }
        return data;
      });
    }

    // Filter by selected category if selected
    if (selectedCategory !== 'All') {
      return chartData.map(d => ({
        month: d.month,
        [selectedCategory]: d[selectedCategory] || 0
      }));
    }

    return chartData;
  };

  const spendingChartData = prepareSpendingChartData();

  // Vendor performance scoring chart data
  const vendorPerformanceData = currentVendors
    .filter(v => selectedVendor === 'All' || v.name === selectedVendor)
    .filter(v => selectedCategory === 'All' || v.category === selectedCategory)
    .map(v => ({
      name: v.name.split(' ')[0], // short name
      fullName: v.name,
      'SLA Score': v.slaScore,
      'Compliance': Math.round(v.slaScore * 0.98 + (v.id % 3)) // mock compliance rating
    }))
    .sort((a,b) => b['SLA Score'] - a['SLA Score']);

  // RFQ Distribution calculation
  const getRfqDistributionData = () => {
    const counts = { Draft: 5, Sent: 12, 'Under Review': 15, 'Closed & Awarded': 6 };
    currentRfqs.forEach(r => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });

    return [
      { name: 'Draft', value: counts['Draft'] || 0 },
      { name: 'Sent', value: counts['Sent'] || 0 },
      { name: 'Under Review', value: counts['Under Review'] || 0 },
      { name: 'Closed & Awarded', value: counts['Closed & Awarded'] || 0 }
    ].filter(item => item.value > 0);
  };

  const rfqDistributionData = getRfqDistributionData();

  // Export PDF with dynamic step timing
  const handleExportPDF = () => {
    setIsExportingPDF(true);
    setPdfProgress(10);
    setPdfSuccess(false);

    // Simulate export step progress
    const steps = [
      { progress: 30, delay: 400 },
      { progress: 60, delay: 800 },
      { progress: 90, delay: 1200 },
      { progress: 100, delay: 1600 }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        setPdfProgress(step.progress);
        if (step.progress === 100) {
          setPdfSuccess(true);
          // Add notification and log
          addNotification('Executive report PDF downloaded successfully', 'success');
          addAuditLog('Executive PDF Exported', 'Procurement executive dashboard summary PDF exported to disk.', 'system', 'Console Administrator');
        }
      }, step.delay);
    });
  };

  // Export CSV of monthly spending
  const handleExportCSV = () => {
    const headers = ['Month', 'Raw Materials', 'Electronics', 'Office Furniture', 'Logistics', 'IT Services'];
    const rows = spendingChartData.map(d => [
      d.month,
      d['Raw Materials'] || 0,
      d['Electronics'] || 0,
      d['Office Furniture'] || 0,
      d['Logistics'] || 0,
      d['IT Services'] || 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `procurement_spending_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Add log
    addNotification('Spending report CSV exported successfully', 'success');
    addAuditLog('Spending CSV Exported', 'Procurement spending trend metrics spreadsheet CSV exported.', 'system', 'Console Administrator');
  };

  // Recharts Custom Tooltip to align with pure black visual layout
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg shadow-2xl space-y-1.5">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between items-center gap-6 text-xs">
              <span className="text-zinc-500 capitalize">{entry.name}:</span>
              <span className="font-semibold text-zinc-100">
                {entry.name.includes('Spend') || typeof entry.value === 'number' && entry.value > 1000 
                  ? `$${entry.value.toLocaleString()}` 
                  : `${entry.value}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Reports & analytics</h2>
          <p className="text-xs text-zinc-500 mt-1">Procurement Insights- may 2025</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
          >
            May 2025
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleExportPDF}
          >
            Export
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Spend KPI */}
        <Card className="border-cyan-950/20 hover:-translate-y-0.5 transition-transform bg-zinc-950/20">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">total spend</span>
          <h3 className="text-2xl font-black text-cyan-400 mt-1">₹ 12.4 L</h3>
        </Card>

        {/* Active Vendors KPI */}
        <Card className="border-emerald-950/20 hover:-translate-y-0.5 transition-transform bg-zinc-950/20">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Active vendors</span>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">28</h3>
        </Card>

        {/* PO Fulfillment KPI */}
        <Card className="border-amber-950/20 hover:-translate-y-0.5 transition-transform bg-zinc-950/20">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">PO Fulfillment</span>
          <h3 className="text-2xl font-black text-amber-500 mt-1">94%</h3>
        </Card>

        {/* Overdue Invoices KPI */}
        <Card className="border-red-950/20 hover:-translate-y-0.5 transition-transform bg-zinc-950/20">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">overdue invoices</span>
          <h3 className="text-2xl font-black text-red-500 mt-1">3</h3>
        </Card>
      </div>

      {/* Layout Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Spend by Category */}
        <Card title="Spend by Category" subtitle="Procurement distribution across categories">
          <div className="space-y-6 py-4">
            {[
              { category: 'IT Hardware', amount: '₹4.8L', percentage: 75, colorClass: 'bg-cyan-500' },
              { category: 'Furniture', amount: '₹3.2L', percentage: 55, colorClass: 'bg-emerald-500' },
              { category: 'Stationery', amount: '₹2.1L', percentage: 35, colorClass: 'bg-amber-500' },
              { category: 'Logistics', amount: '₹2.3L', percentage: 40, colorClass: 'bg-blue-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-zinc-350">
                  <span>{item.category}</span>
                  <span className="font-bold text-zinc-200">{item.amount}</span>
                </div>
                <div className="w-full bg-zinc-900/60 h-2 rounded-full overflow-hidden border border-zinc-800/40">
                  <div className={`h-full rounded-full ${item.colorClass}`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Side: Top Vendors & Monthly Trend */}
        <div className="space-y-6">
          {/* Top Vendors by Spend */}
          <Card title="Top Vendors by Spend" subtitle="Highest spending supplier accounts">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/30 text-zinc-500 font-bold uppercase tracking-wider">
                    <th className="px-4 py-2.5">Vendor</th>
                    <th className="px-4 py-2.5">Spend (₹)</th>
                    <th className="px-4 py-2.5">POs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {[
                    { vendor: 'TechCore Ltd', spend: '4,20,000', pos: 6 },
                    { vendor: 'Infra Supplies', spend: '3,10,000', pos: 4 },
                    { vendor: 'FastLog', spend: '1,90,000', pos: 3 }
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/10">
                      <td className="px-4 py-2.5 font-bold text-zinc-300">{item.vendor}</td>
                      <td className="px-4 py-2.5 text-cyan-400 font-extrabold">₹ {item.spend}</td>
                      <td className="px-4 py-2.5 text-zinc-400 font-semibold">{item.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Monthly Trend Bar Chart */}
          <Card title="Monthly Trend" subtitle="Transactional volumes over time">
            <div className="h-44 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { month: 'Dec', value: 40000 },
                  { month: 'Jan', value: 55000 },
                  { month: 'Feb', value: 45000 },
                  { month: 'Mar', value: 80000 },
                  { month: 'Apr', value: 70000 },
                  { month: 'May', value: 95000 },
                ]} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* PDF Export Overlay Simulator Modal */}
      {isExportingPDF && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 z-50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-xl p-6 text-center space-y-5 shadow-2xl">
            {!pdfSuccess ? (
              <div className="space-y-4 py-2">
                <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto glow-cyan" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Generating PDF Report</h4>
                  <p className="text-xs text-zinc-500">Compiling charts, formatting metrics data, and packing SVGs...</p>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pdfProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-600 font-bold uppercase">{pdfProgress}% Completed</span>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <CheckCircle2 className="w-11 h-11 text-emerald-400 mx-auto" />
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">PDF Report Ready</h4>
                  <p className="text-xs text-zinc-500">The procurement summary PDF file has been generated and downloaded successfully.</p>
                </div>
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsExportingPDF(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
