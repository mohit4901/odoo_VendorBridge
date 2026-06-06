import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext/NotificationContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Clock, 
  User, 
  ArrowUpDown,
  FileQuestion,
  Users,
  FileCheck,
  Receipt,
  AlertCircle
} from 'lucide-react';

const ActivityLogs = () => {
  const { auditLogs, clearAllAuditLogs } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, RFQ, Vendor, PO, Invoice, System
  const [selectedUser, setSelectedUser] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest, asc = oldest
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Available unique users in logs
  const availableUsers = ['All', ...new Set(auditLogs.map(log => log.user))];

  // Helper for matching type icons
  const getLogIcon = (type) => {
    const iconSizeClass = "w-4 h-4";
    switch (type.toLowerCase()) {
      case 'rfq': 
        return <FileQuestion className={`${iconSizeClass} text-violet-400`} />;
      case 'vendor': 
        return <Users className={`${iconSizeClass} text-emerald-400`} />;
      case 'po': 
        return <FileCheck className={`${iconSizeClass} text-amber-400`} />;
      case 'invoice': 
        return <Receipt className={`${iconSizeClass} text-cyan-400`} />;
      default: 
        return <AlertCircle className={`${iconSizeClass} text-zinc-400`} />;
    }
  };

  // Helper for type bg styles
  const getLogIconBg = (type) => {
    switch (type.toLowerCase()) {
      case 'rfq': return 'bg-violet-950/45 border-violet-900/50';
      case 'vendor': return 'bg-emerald-950/45 border-emerald-900/50';
      case 'po': return 'bg-amber-950/45 border-amber-900/50';
      case 'invoice': return 'bg-cyan-950/45 border-cyan-900/50';
      default: return 'bg-zinc-900/80 border-zinc-800';
    }
  };

  // Handle mock CSV download
  const handleExportCSV = () => {
    if (auditLogs.length === 0) return;
    const headers = ['ID', 'Type', 'Title', 'Description', 'Actor', 'Time'];
    const rows = auditLogs.map(log => [
      log.id,
      log.type.toUpperCase(),
      log.title,
      log.desc,
      log.user,
      log.time
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vendorbridge_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAllLogs = () => {
    clearAllAuditLogs();
    setIsConfirmClearOpen(false);
  };

  // Filtering logs
  const filteredLogs = auditLogs
    .filter(log => {
      const matchesSearch = 
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.desc.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === 'All' || log.type.toLowerCase() === activeTab.toLowerCase();
      const matchesUser = selectedUser === 'All' || log.user === selectedUser;

      return matchesSearch && matchesTab && matchesUser;
    })
    .sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.id - a.id;
      } else {
        return a.id - b.id;
      }
    });

  const categories = ['All', 'RFQ', 'Vendor', 'PO', 'Invoice', 'System'];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">System Audit Trail</h2>
          <p className="text-xs text-zinc-500 mt-1">Complete, immutable ledger of all procurement actions, user operations, and transaction timelines.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            icon={Download} 
            onClick={handleExportCSV}
            disabled={auditLogs.length === 0}
          >
            Export Logs (.CSV)
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            icon={Trash2} 
            onClick={() => setIsConfirmClearOpen(true)}
            disabled={auditLogs.length === 0}
          >
            Clear Trail
          </Button>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <Card noPadding>
        <div className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex items-center w-full md:max-w-md">
              <Search className="w-4.5 h-4.5 text-zinc-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search audit actions, titles, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs rounded-lg pl-11 pr-4 py-2.5 text-zinc-200 placeholder-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* User Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">User:</span>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs px-3 py-2 text-zinc-300 outline-none focus:border-cyan-500/50 transition-colors"
                >
                  {availableUsers.map((u, idx) => (
                    <option key={idx} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Sorting Button */}
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>
            </div>
          </div>

          {/* Module Filter Chips */}
          <div className="border-t border-zinc-900/60 pt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                  ${activeTab === cat 
                    ? 'bg-cyan-500/5 border-cyan-500/30 text-cyan-400' 
                    : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Chronological Timeline Panel */}
      <Card>
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-zinc-400 font-semibold text-sm">No Audit Logs Found</h3>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto mt-1 leading-relaxed">
              No system entries match the current search filters. Try updating your criteria.
            </p>
          </div>
        ) : (
          <div className="relative border-l border-zinc-900 ml-4.5 pl-8 py-3 space-y-7">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Timeline Icon Marker Node */}
                <div className={`absolute -left-[45px] top-0.5 w-8.5 h-8.5 rounded-lg border flex items-center justify-center
                  shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-105 duration-150 z-10
                  ${getLogIconBg(log.type)}`}
                >
                  {getLogIcon(log.type)}
                </div>

                {/* Log Event Details */}
                <div className="bg-zinc-950/40 border border-zinc-900/70 rounded-xl p-4.5 space-y-2 hover:border-zinc-800/80 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-xs font-bold text-zinc-100 tracking-wide">{log.title}</h4>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {log.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-700" />
                      {log.time}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">{log.desc}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                    <User className="w-3 h-3 text-zinc-700" />
                    <span>Actor: {log.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Confirmation Modal to Clear Trail */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-xl p-6 space-y-5 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Purge Audit Log Trail?</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Are you sure you want to permanently clear the system audit log? This transaction history cannot be restored.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsConfirmClearOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={handleClearAllLogs}
              >
                Clear History
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
