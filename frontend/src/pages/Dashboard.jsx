import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  DollarSign,
  AlertTriangle,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  FileCheck,
  Receipt,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Award,
  CheckCircle2,
  UserPlus
} from 'lucide-react';

import Card from '../components/Card';
import Button from '../components/Button';
import ProcurementHero from '../components/ui/ProcurementHero';
import { BadgeDelta } from '../components/ui/badge-delta';
import { ActivityChartCard } from '../components/ui/activity-chart-card';
import { useRFQs } from '../context/RFQContext/RFQContext';
import { useApprovals } from '../context/ApprovalContext/ApprovalContext';
import { useInvoices } from '../context/InvoiceContext/InvoiceContext';
import api from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();

  // Get live lists from contexts
  const { rfqs, quotes } = useRFQs();
  const { approvals, purchaseOrders } = useApprovals();
  const { invoices } = useInvoices();

  // Selected stage in the pipeline flowchart
  const [activeStage, setActiveStage] = useState(null); // null, 1, 2, 3, 4, 5

  // Summary state fetched from backend dashboard API
  const [summaryData, setSummaryData] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        if (res.success && res.data) {
          setSummaryData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard summary:', err);
      } finally {
        setApiLoading(false);
      }
    };
    fetchDashboardSummary();
  }, []);

  // Map live lists to the explorer console variables
  const rfqList = rfqs.map((rfq) => ({
    id: rfq._id || rfq.id,
    title: rfq.title,
    category: rfq.category,
    status: rfq.status,
    deadline: rfq.deliveryDate || rfq.deadline || 'N/A'
  }));

  const quoteList = quotes.map((q) => ({
    id: q._id || q.id,
    vendorName: q.vendorName,
    totalBid: q.totalBid || q.totalCost || 0,
    deliveryTime: q.deliveryTime,
    status: q.status
  }));

  const approvalList = approvals.map((app) => ({
    id: app._id || app.id,
    rfqTitle: app.rfqTitle,
    vendorName: app.vendorName,
    amount: app.amount,
    status: app.status
  }));

  const poList = purchaseOrders.map((po) => ({
    id: po._id || po.id,
    poRef: po.poRef,
    vendorName: po.vendorName,
    amount: po.amount,
    date: po.date
  }));

  const invoiceList = invoices.map((inv) => ({
    id: inv._id || inv.id,
    invoiceRef: inv.invoiceRef,
    vendorName: inv.vendorName,
    total: inv.total,
    dueDate: inv.dueDate,
    status: inv.status
  }));

  // Dynamic pipeline lifecycle counts
  const pipelineCounts = {
    rfqs: rfqs.filter(r => r.status !== 'Closed & Awarded').length || 12,
    quotes: quotes.length || 38,
    approvals: approvals.filter(a => a.status !== 'Issued' && a.status !== 'Rejected').length || 5,
    pos: purchaseOrders.length || 15,
    paidInvoices: invoices.filter(i => i.status === 'Paid').length || 18
  };

  // Compile metrics from API summary
  const metrics = summaryData?.metrics ? summaryData.metrics.map((m) => {
    let icon;
    if (m.metricKey === 'spend') icon = <span className="text-violet-400 font-bold text-lg">₹</span>;
    else if (m.metricKey === 'vendors') icon = <UserPlus className="w-5 h-5 text-violet-400" />;
    else if (m.metricKey === 'rfqs') icon = <FileText className="w-5 h-5 text-violet-400" />;
    else icon = <CheckCircle2 className="w-5 h-5 text-violet-400" />;

    return {
      value: m.value.replace('$', '₹'), // Display in Rupee symbol matching initial UI design
      label: m.title,
      trend: m.trend,
      deltaType: m.trendType === 'positive' ? 'increase' : m.trendType === 'negative' ? 'decrease' : 'neutral',
      timeframe: m.timeframe,
      icon
    };
  }) : [
    {
      value: '12',
      label: "Active RFQ's",
      trend: '+4.5%',
      deltaType: 'increase',
      timeframe: 'vs last month',
      icon: <FileText className="w-5 h-5 text-violet-400" />
    },
    {
      value: '5',
      label: 'Pending Approvals',
      trend: 'L1/L2',
      deltaType: 'neutral',
      timeframe: 'awaiting review',
      icon: <Clock className="w-5 h-5 text-violet-400" />
    },
    {
      value: '₹ 2.3L',
      label: "PO's this month",
      trend: '+12.4%',
      deltaType: 'increase',
      timeframe: 'vs last month',
      icon: <span className="text-violet-400 font-bold text-lg">₹</span>
    },
    {
      value: '3',
      label: 'Overdue Invoices',
      trend: '-2 due',
      deltaType: 'decrease',
      timeframe: 'action needed',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />
    }
  ];

  // Dynamically load recent purchases from purchaseOrders list
  const recentPurchases = purchaseOrders.length > 0 ? purchaseOrders.slice(0, 3).map((po, idx) => ({
    poNo: po.poRef || `PO${idx + 1}`,
    vendor: po.vendorName,
    amount: po.amount,
    status: po.status
  })) : [
    { poNo: 'PO1', vendor: 'Infra Supplies Pvt Ltd', amount: 87000, status: 'Approved' },
    { poNo: 'PO2', vendor: 'Techcore LTD', amount: 140000, status: 'Pending' },
    { poNo: 'PO3', vendor: 'OfficeNeed Co', amount: 39900, status: 'Draft' },
  ];

  // Map spend breakdown trend from API
  const spendTrendData = summaryData?.spendingBreakdown ? summaryData.spendingBreakdown.map((s) => ({
    day: s.month,
    value: s.Direct + s.Indirect + s.Services
  })) : [
    { day: 'Dec', value: 110000 },
    { day: 'Jan', value: 140000 },
    { day: 'Feb', value: 125000 },
    { day: 'Mar', value: 195000 },
    { day: 'Apr', value: 170000 },
    { day: 'May', value: 230000 },
  ];

  const rfqActivityData = [
    { day: 'Mon', value: 3 },
    { day: 'Tue', value: 7 },
    { day: 'Wed', value: 5 },
    { day: 'Thu', value: 12 },
    { day: 'Fri', value: 9 },
    { day: 'Sat', value: 4 },
    { day: 'Sun', value: 2 },
  ];

  // Returns a BadgeDelta element for table status cells
  const StatusBadge = ({ status }) => {
    if (status === 'Approved' || status === 'Paid')
      return <BadgeDelta variant="solidOutline" deltaType="increase" value={status} />;
    if (status === 'Pending' || status === 'Pending Payment')
      return <BadgeDelta variant="solidOutline" deltaType="neutral" value={status} />;
    if (status === 'Rejected' || status === 'Overdue')
      return <BadgeDelta variant="solidOutline" deltaType="decrease" value={status} />;
    return <BadgeDelta variant="solidOutline" deltaType="neutral" value={status} />;
  };



  // Pipeline flow items definition
  const pipelineFlowItems = [
    {
      step: 1,
      stage: '1. RFQs DISPATCHED',
      count: pipelineCounts.rfqs,
      desc: 'Active requests published',
      icon: FileText,
      color: 'border-violet-500/20 text-violet-400',
      glow: 'glow-violet',
      pulse: 'pulse-cyan',
      lineColor: 'text-violet-500'
    },
    {
      step: 2,
      stage: '2. BID QUOTATIONS',
      count: pipelineCounts.quotes,
      desc: 'Supplier price bids',
      icon: FileSpreadsheet,
      color: 'border-violet-500/20 text-violet-400',
      glow: 'glow-violet',
      pulse: 'pulse-cyan',
      lineColor: 'text-violet-500'
    },
    {
      step: 3,
      stage: '3. AWAITING REVIEWS',
      count: pipelineCounts.approvals,
      desc: 'Approval authorization queue',
      icon: Clock,
      color: 'border-amber-500/20 text-amber-400',
      glow: 'glow-amber',
      pulse: 'pulse-amber',
      lineColor: 'text-amber-500'
    },
    {
      step: 4,
      stage: '4. POs DISPATCHED',
      count: pipelineCounts.pos,
      desc: 'Issued contract POs',
      icon: FileCheck,
      color: 'border-emerald-500/20 text-emerald-400',
      glow: 'glow-emerald',
      pulse: 'pulse-emerald',
      lineColor: 'text-emerald-500'
    },
    {
      step: 5,
      stage: '5. INVOICES SETTLED',
      count: pipelineCounts.paidInvoices,
      desc: 'Paid invoices',
      icon: Receipt,
      color: 'border-emerald-500/20 text-emerald-400',
      glow: 'glow-emerald',
      pulse: 'pulse-emerald',
      lineColor: ''
    }
  ];

  return (
    <div className="space-y-6">
      {/* Premium Animated Hero Banner */}
      <ProcurementHero pipelineCounts={pipelineCounts} />

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <Card key={i} className="hoverable transition-transform hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-extrabold text-zinc-100 tracking-tight">{metric.value}</h3>
                <span className="text-xs font-semibold text-zinc-400 tracking-wide mt-1 block">{metric.label}</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center">
                {metric.icon}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <BadgeDelta
                variant="solidOutline"
                deltaType={metric.deltaType}
                iconStyle="filled"
                value={metric.trend}
              />
              <span className="text-[10px] text-zinc-600 font-semibold">{metric.timeframe}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Interactive Workflow Pipeline Diagram */}
      <Card title="Procurement Lifecycle Status Diagram" subtitle="Click any stage below to inspect active transaction lines in the console dynamically">
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-2 lg:gap-0 pt-2 select-none">
          {pipelineFlowItems.map((item, idx) => {
            const IconComponent = item.icon;
            const isSelected = activeStage === item.step;

            return (
              <React.Fragment key={idx}>
                {/* Stage Node Circle Card */}
                <div
                  onClick={() => setActiveStage(isSelected ? null : item.step)}
                  className={`flex-1 p-4 rounded-xl border bg-zinc-950 flex flex-col justify-between h-32 hover:border-violet-500/60 transition-all hover:-translate-y-1 duration-300 cursor-pointer relative group
                    ${isSelected ? 'active-pulse' : `border-zinc-900/80 ${item.glow}`}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider leading-none group-hover:text-zinc-350 transition-colors">
                      {item.stage}
                    </span>
                    <BadgeDelta
                      variant="solidOutline"
                      deltaType={item.step <= 2 ? 'increase' : item.step === 3 ? 'neutral' : 'increase'}
                      value={item.count}
                      className="text-[10px]"
                    />
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{item.desc}</div>
                      {/* Active sync indicator */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className={`w-2 h-2 rounded-full ${item.pulse} shrink-0`} />
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider group-hover:text-zinc-550 transition-colors">Sync Active</span>
                      </div>
                    </div>
                    <div className={`w-9 h-9 rounded-lg border border-zinc-800/80 flex items-center justify-center bg-zinc-900/40 group-hover:border-violet-500/30 transition-all
                      ${isSelected ? 'bg-violet-500/10 text-violet-400 border-violet-500/30' : 'text-zinc-500 group-hover:text-zinc-200'}
                    `}>
                      <IconComponent className="w-5 h-5 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Flow connector line (desktop) */}
                {idx < 4 && (
                  <div className="hidden lg:flex items-center justify-center shrink-0 px-2">
                    <svg width="28" height="14" viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                      <path d="M0 7H24" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" />
                      <path
                        className={`animate-dash-flow ${item.lineColor}`}
                        d="M0 7H24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path d="M18 2L24 7L18 12" stroke="#27272a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* EXPLORATION CONSOLE PANEL */}
      {activeStage !== null ? (
        <Card
          title={
            activeStage === 1 ? "Pipeline Stage 1: Active RFQs" :
              activeStage === 2 ? "Pipeline Stage 2: Submitted Quotations" :
                activeStage === 3 ? "Pipeline Stage 3: Awaiting Reviews" :
                  activeStage === 4 ? "Pipeline Stage 4: Dispatched Purchase Orders" :
                    "Pipeline Stage 5: Settled & Paid Invoices"
          }
          subtitle="Direct list of items currently situated at this stage. Click deep-link actions to navigate."
          headerAction={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveStage(null)}
            >
              Clear Filter
            </Button>
          }
          className="border-violet-500/20 shadow-[0_0_25px_rgba(139,92,246,0.07)] animate-fadeIn duration-300"
        >
          {/* RFQ exploration details */}
          {activeStage === 1 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">RFQ Ref</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Target Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {rfqList.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-zinc-900/10">
                      <td className="px-4 py-3 font-bold text-violet-400">RFQ-2026-{rfq.id.toString().slice(-3)}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-200">{rfq.title}</td>
                      <td className="px-4 py-3 text-zinc-400">{rfq.category}</td>
                      <td className="px-4 py-3 text-zinc-500">{rfq.deadline}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded border border-violet-900 text-violet-400 uppercase text-[9px] font-bold bg-violet-950/20">
                          {rfq.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate('/rfqs')} icon={ArrowRight}>
                          RFQ Portal
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quotations exploration details */}
          {activeStage === 2 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Bid Ref</th>
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3 text-center">Bid Total</th>
                    <th className="px-4 py-3 text-center">Lead Delivery</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {quoteList.map((q) => (
                    <tr key={q.id} className="hover:bg-zinc-900/10">
                      <td className="px-4 py-3 font-bold text-violet-400">QT-{q.id}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-200">{q.vendorName}</td>
                      <td className="px-4 py-3 text-center text-emerald-400 font-extrabold">₹{q.totalBid.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-zinc-400">{q.deliveryTime}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate('/quotations')} icon={ArrowRight}>
                          Bids Portal
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Approvals exploration details */}
          {activeStage === 3 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Req ID</th>
                    <th className="px-4 py-3">RFQ Subject</th>
                    <th className="px-4 py-3">Selected Bidder</th>
                    <th className="px-4 py-3 text-center">Value</th>
                    <th className="px-4 py-3">Current Stage</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {approvalList.map((app) => (
                    <tr key={app.id} className="hover:bg-zinc-900/10">
                      <td className="px-4 py-3 font-bold text-violet-400">APP-2026-{app.id.toString().slice(-3)}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-200">{app.rfqTitle}</td>
                      <td className="px-4 py-3 text-zinc-300 font-medium">{app.vendorName}</td>
                      <td className="px-4 py-3 text-center text-emerald-400 font-bold">₹{app.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded border border-amber-800 text-amber-400 uppercase text-[9px] font-bold bg-amber-950/20">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate('/approvals')} icon={ArrowRight}>
                          Approve Bid
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PO exploration details */}
          {activeStage === 4 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">PO Reference</th>
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3 text-center">Order Amount</th>
                    <th className="px-4 py-3">Date Dispatched</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {poList.map((po) => (
                    <tr key={po.id} className="hover:bg-zinc-900/10">
                      <td className="px-4 py-3 font-bold text-violet-400">{po.poRef}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-200">{po.vendorName}</td>
                      <td className="px-4 py-3 text-center text-zinc-100 font-bold">₹{po.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-zinc-500">{po.date}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate('/purchase-orders')} icon={ArrowRight}>
                          PO Registry
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Invoices exploration details */}
          {activeStage === 5 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Invoice Ref</th>
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3 text-center">Bill Total</th>
                    <th className="px-4 py-3 text-center">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {invoiceList.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-900/10">
                      <td className="px-4 py-3 font-bold text-violet-400">{inv.invoiceRef}</td>
                      <td className="px-4 py-3 font-semibold text-zinc-200">{inv.vendorName}</td>
                      <td className="px-4 py-3 text-center text-violet-400 font-extrabold">₹{inv.total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-zinc-500">{inv.dueDate}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => navigate('/invoices')} icon={ArrowRight}>
                          Billing Portal
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : null}

      {/* Charts Grid — Spend Trend + RFQ Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases Table */}
        <Card title="Recent Purchases" subtitle="Latest procurement purchase order transactions">
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/20 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">PO#</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {recentPurchases.map((po, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-violet-400">{po.poNo}</td>
                    <td className="px-4 py-3.5 text-zinc-300 font-medium">{po.vendor}</td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-100">₹{po.amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={po.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Animated Charts stacked */}
        <div className="flex flex-col gap-4">
          <ActivityChartCard
            title="Monthly Spend Trend"
            totalValue="₹2.3L"
            subtitle="total this month"
            trend="+18% from last month"
            data={spendTrendData}
            barColor="bg-violet-500"
            dropdownOptions={['Monthly', 'Quarterly', 'Yearly']}
          />
          <ActivityChartCard
            title="RFQ Activity"
            totalValue={`${pipelineCounts.rfqs}`}
            subtitle="active RFQs"
            trend="+4.5% this week"
            data={rfqActivityData}
            barColor="bg-emerald-500"
            dropdownOptions={['Weekly', 'Monthly']}
          />
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-wrap items-center justify-start gap-4 pt-4 border-t border-zinc-900">
        <button
          onClick={() => navigate('/rfqs')}
          className="px-5 py-2.5 bg-black border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-950 text-xs font-bold text-zinc-300 hover:text-violet-400 rounded-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          new RFQ
        </button>
        <button
          onClick={() => navigate('/vendors')}
          className="px-5 py-2.5 bg-black border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-950 text-xs font-bold text-zinc-300 hover:text-violet-400 rounded-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
        <button
          onClick={() => navigate('/invoices')}
          className="px-5 py-2.5 bg-black border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-950 text-xs font-bold text-zinc-300 hover:text-violet-400 rounded-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          view Invoices
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
