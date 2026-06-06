import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Card from '../components/Card';
import Button from '../components/Button';

const Dashboard = () => {
  const navigate = useNavigate();

  const metrics = [
    {
      value: '12',
      label: "Active RFQ's",
      trend: '+4.5%',
      isPositive: true,
      timeframe: 'vs last month',
      icon: <FileText className="w-5 h-5 text-cyan-400" />
    },
    {
      value: '5',
      label: 'Pending Approvals',
      trend: 'Awaiting L1/L2',
      isPositive: true,
      timeframe: 'verification',
      icon: <Clock className="w-5 h-5 text-cyan-400" />
    },
    {
      value: '₹ 2.3L',
      label: "PO's this month",
      trend: '+12.4%',
      isPositive: true,
      timeframe: 'vs last month',
      icon: <span className="text-cyan-400 font-bold text-lg">₹</span>
    },
    {
      value: '3',
      label: 'overdue invoices',
      trend: 'Action needed',
      isPositive: false,
      timeframe: 'reconciliation',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />
    }
  ];

  const recentPurchases = [
    { poNo: 'PO1', vendor: 'Infra Supplies Pvt Ltd', amount: 87000, status: 'Approved' },
    { poNo: 'PO2', vendor: 'Techcore LTD', amount: 140000, status: 'Pending' },
    { poNo: 'PO3', vendor: 'OfficeNeed Co', amount: 39900, status: 'Draft' },
  ];

  const spendTrendData = [
    { month: 'Dec', Spend: 110000 },
    { month: 'Jan', Spend: 140000 },
    { month: 'Feb', Spend: 125000 },
    { month: 'Mar', Spend: 195000 },
    { month: 'Apr', Spend: 170000 },
    { month: 'May', Spend: 230000 },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400';
      case 'Pending':
        return 'bg-amber-950/40 border-amber-900/50 text-amber-400';
      default:
        return 'bg-zinc-900 border-zinc-800 text-zinc-400';
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg shadow-2xl">
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Spend Value</p>
          <p className="text-xs font-bold text-cyan-400 mt-1">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Bar / Hero Banner */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">Welcome back, Procurement Officer</h2>
        <p className="text-xs text-zinc-500 mt-1">Today's Overview & Action items</p>
      </div>

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
            <div className="flex items-center gap-1.5 mt-3 text-[10px]">
              <span className={`font-bold ${metric.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {metric.trend}
              </span>
              <span className="text-zinc-600 font-semibold">{metric.timeframe}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Purchases and Spend Trends Grid */}
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
                    <td className="px-4 py-3.5 font-bold text-cyan-400">{po.poNo}</td>
                    <td className="px-4 py-3.5 text-zinc-300 font-medium">{po.vendor}</td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-100">₹{po.amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded border uppercase text-[9px] font-bold tracking-wider ${getStatusBadge(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Spend Trends Line Chart */}
        <Card title="Spending Trends last 6 months" subtitle="Monthly procurement spend trend analysis in Indian Rupees">
          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#18181b" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Spend" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-wrap items-center justify-start gap-4 pt-4 border-t border-zinc-900">
        <button
          onClick={() => navigate('/rfqs')}
          className="px-5 py-2.5 bg-black border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-950 text-xs font-bold text-zinc-300 hover:text-cyan-400 rounded-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          new RFQ
        </button>
        <button
          onClick={() => navigate('/vendors')}
          className="px-5 py-2.5 bg-black border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-950 text-xs font-bold text-zinc-300 hover:text-cyan-400 rounded-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </button>
        <button
          onClick={() => navigate('/invoices')}
          className="px-5 py-2.5 bg-black border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-950 text-xs font-bold text-zinc-300 hover:text-cyan-400 rounded-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          view Invoices
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
