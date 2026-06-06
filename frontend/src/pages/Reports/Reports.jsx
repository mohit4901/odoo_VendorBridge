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
          <h2 className="text-lg font-bold text-white tracking-wide">Reports & Analytics</h2>
          <p className="text-xs text-zinc-500 mt-1">Multi-dimensional dashboard tracking procurement efficiency, corporate spends, and supplier compliance metrics.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            icon={Download} 
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Award} 
            onClick={handleExportPDF}
          >
            Download PDF Summary
          </Button>
        </div>
      </div>

      {/* Dynamic Filters Row */}
      <Card noPadding>
        <div className="p-4 flex flex-wrap items-center gap-4.5 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Timeframe:</span>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 rounded-lg text-xs px-3 py-1.5 text-zinc-300 outline-none focus:border-cyan-500/50"
            >
              <option>All Time</option>
              <option>YTD (2026)</option>
              <option>Last 90 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Category:</span>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 rounded-lg text-xs px-3 py-1.5 text-zinc-300 outline-none focus:border-cyan-500/50"
            >
              <option value="All">All Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Electronics">Electronics</option>
              <option value="Office Furniture">Office Furniture</option>
              <option value="Logistics">Logistics</option>
              <option value="IT Services">IT Services</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Vendor:</span>
            <select 
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 rounded-lg text-xs px-3 py-1.5 text-zinc-300 outline-none focus:border-cyan-500/50"
            >
              <option value="All">All Vendors</option>
              {currentVendors.map((v) => (
                <option key={v.id} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Spend KPI */}
        <Card className="hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Total Procurement Spend</span>
              <h3 className="text-2xl font-black text-zinc-100 mt-2">${totalSpend.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-cyan-950/40 border border-cyan-900/40 rounded-lg">
              <DollarSign className="w-4.5 h-4.5 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs last quarter</span>
          </div>
        </Card>

        {/* Avg SLA KPI */}
        <Card className="hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Average Supplier SLA</span>
              <h3 className="text-2xl font-black text-zinc-100 mt-2">{avgSla}%</h3>
            </div>
            <div className="p-2 bg-emerald-950/40 border border-emerald-900/40 rounded-lg">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold mt-4">
            <span>SLA targeting standard &gt;90%</span>
          </div>
        </Card>

        {/* RFQ Conversion KPI */}
        <Card className="hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">RFQ Conversion Rate</span>
              <h3 className="text-2xl font-black text-zinc-100 mt-2">{rfqConversionRate}%</h3>
            </div>
            <div className="p-2 bg-violet-950/40 border border-violet-900/40 rounded-lg">
              <FileQuestion className="w-4.5 h-4.5 text-violet-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2.3% cycle progression</span>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Category Spend Area Chart */}
        <div className="xl:col-span-2">
          <Card title="Spend Analytics by Category" subtitle="Monthly department transaction values">
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#e4e4e7' }} />
                  {selectedCategory !== 'All' ? (
                    <Area type="monotone" dataKey={selectedCategory} stroke="#06b6d4" strokeWidth={2} fill="url(#colorSpend)" />
                  ) : (
                    <>
                      <Area type="monotone" dataKey="Raw Materials" stroke="#06b6d4" strokeWidth={2} fill="none" />
                      <Area type="monotone" dataKey="Electronics" stroke="#6366f1" strokeWidth={2} fill="none" />
                      <Area type="monotone" dataKey="Office Furniture" stroke="#f59e0b" strokeWidth={2} fill="none" />
                      <Area type="monotone" dataKey="Logistics" stroke="#10b981" strokeWidth={2} fill="none" />
                      <Area type="monotone" dataKey="IT Services" stroke="#ec4899" strokeWidth={2} fill="none" />
                    </>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* RFQ Status Share Pie Chart */}
        <div>
          <Card title="RFQ Funnel Share" subtitle="Status breakdown of negotiation records">
            <div className="h-80 w-full flex flex-col justify-between pt-4">
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rfqDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {rfqDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] border-t border-zinc-900/60 pt-4 px-1">
                {rfqDistributionData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-zinc-400 font-semibold truncate">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Vendor SLA Performance Scoreboard */}
      <Card title="Vendor Scorecard Comparison" subtitle="Supplier SLA rating vs contract compliance scores">
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vendorPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#18181b" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="rect" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="SLA Score" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Compliance" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

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
