import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileQuestion, 
  FileSpreadsheet,
  ClipboardCheck,
  FileCheck, 
  Receipt, 
  BarChart3, 
  History,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Vendors', path: '/vendors', icon: Users },
    { name: 'RFQs', path: '/rfqs', icon: FileQuestion },
    { name: 'Quotations', path: '/quotations', icon: FileSpreadsheet },
    { name: 'Approvals', path: '/approvals', icon: ClipboardCheck },
    { name: 'Purchase orders', path: '/purchase-orders', icon: FileCheck },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Activity', path: '/activity', icon: History }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 bg-zinc-950 border-r border-zinc-900/80 flex flex-col transition-transform duration-300 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand/Logo Header */}
        <div className="h-16 border-b border-zinc-900/60 px-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center glow-cyan">
              <span className="text-cyan-400 font-bold text-base tracking-wider group-hover:scale-105 transition-transform">VB</span>
            </div>
            <span className="text-zinc-100 font-bold text-md tracking-wider group-hover:text-cyan-400 transition-colors">
              Vendor<span className="text-cyan-400">Bridge</span>
            </span>
          </Link>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <div className="text-[10px] font-bold text-zinc-500 uppercase px-3 mb-2 tracking-wider">
            Procurement Core
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group cursor-pointer
                  ${isActive 
                    ? 'bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 font-medium shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 border border-transparent'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-105 ${isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer/System Status */}
        <div className="p-4 border-t border-zinc-900/60 bg-zinc-950/60">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-emerald-950/15 border border-emerald-900/30">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="text-[11px] font-medium text-emerald-400">
              ERP Node connected
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
