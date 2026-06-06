import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  FileQuestion, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Activity, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import Card from '../components/Card';
import Button from '../components/Button';
import { 
  mockDashboardMetrics, 
  mockSpendingChartData, 
  mockRfqStatusData, 
  mockRecentActivities, 
  mockPendingApprovals 
} from '../mock/dashboardData';

const Dashboard = () => {
  const navigate = useNavigate();

  // Helper for metrics icons
  const getMetricIcon = (key) => {
    switch (key) {
      case 'spend': return <DollarSign className="w-5 h-5 text-cyan-400" />;
      case 'vendors': return <Users className="w-5 h-5 text-cyan-400" />;
      case 'rfqs': return <FileQuestion className="w-5 h-5 text-cyan-400" />;
      case 'compliance': return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
      default: return <Activity className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'medium': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'low': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default: return 'bg-zinc-500/10 border-zinc-800 text-zinc-400';
    }
  };

  // Custom tooltips for recharts to match dark aesthetics
  const CustomSpendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-lg shadow-2xl">
          <p className="text-xs font-bold text-zinc-300 mb-2">{label} Spending</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between items-center gap-6 text-xs">
              <span className="text-zinc-500 capitalize">{entry.name}:</span>
              <span className="font-semibold text-zinc-100">${entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg shadow-2xl text-xs font-semibold text-zinc-200">
          {payload[0].name}: <span className="text-cyan-400 ml-1">{payload[0].value} RFQs</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Bar / Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden">
        {/* Decorative subtle background gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-950/10 to-transparent pointer-events-none"></div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Procurement Control Dashboard</h2>
          <p className="text-xs text-zinc-500 mt-1">Configure and manage suppliers, negotiate RFQs, approve workflows, and track invoice statuses.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            icon={Plus}
            onClick={() => navigate('/vendors')}
          >
            New Vendor
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus}
            onClick={() => navigate('/rfqs')}
          >
            Create RFQ
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {mockDashboardMetrics.map((metric, i) => (
          <Card key={i} className="hoverable transition-transform hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{metric.title}</span>
                <h3 className="text-2xl font-bold text-zinc-100 tracking-tight mt-1.5">{metric.value}</h3>
              </div>
              <div className="w-9 h-9 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-center">
                {getMetricIcon(metric.metricKey)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[11px]">
              <span className={`flex items-center gap-0.5 font-bold ${metric.trendType === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                {metric.trendType === 'positive' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {metric.trend}
              </span>
              <span className="text-zinc-500 font-medium">{metric.timeframe}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Spend Trend Chart */}
        <div className="xl:col-span-2">
          <Card title="Monthly Spending Analytics" subtitle="Procurement spending category trend values (USD)">
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockSpendingChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorIndirect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip content={<CustomSpendTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#e4e4e7' }} />
                  <Area type="monotone" dataKey="Direct" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorDirect)" />
                  <Area type="monotone" dataKey="Indirect" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIndirect)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* RFQ Status Distribution Chart */}
        <div>
          <Card title="RFQ Distribution" subtitle="Active negotiation stages share">
            <div className="h-80 w-full flex flex-col justify-between pt-4">
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockRfqStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {mockRfqStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-zinc-900/60 pt-4 px-2">
                {mockRfqStatusData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-zinc-400 font-medium truncate">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Activities and Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card title="Pending Workflow Approvals" subtitle="Awaiting validation to advance to next stage">
          <div className="space-y-3.5 mt-2">
            {mockPendingApprovals.map((task) => (
              <div 
                key={task.id} 
                className="p-3.5 bg-zinc-950/60 border border-zinc-900 hover:border-zinc-800 rounded-lg flex justify-between items-start gap-4 transition-all cursor-pointer group"
                onClick={() => navigate('/purchase-orders')}
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                    <span>{task.title}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-medium">{task.desc}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                  <span className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-600" />
                    {task.dueDate}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-400 group-hover:underline flex items-center gap-1">
                    Review <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card title="Recent Activity Audit Log" subtitle="Real-time system transaction events log">
          <div className="relative border-l border-zinc-900 ml-3.5 pl-6 py-1 space-y-5">
            {mockRecentActivities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Timeline Icon Marker */}
                <div className="absolute -left-[31px] top-0.5 w-2.5 h-2.5 rounded-full bg-zinc-950 border-2 border-cyan-500 flex items-center justify-center glow-cyan">
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-xs font-bold text-zinc-300">{act.title}</h4>
                    <span className="text-[10px] text-zinc-600 font-medium">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{act.desc}</p>
                  <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider pt-0.5">
                    User: {act.user}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
