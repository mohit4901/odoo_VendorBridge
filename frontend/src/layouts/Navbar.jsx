import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, 
  Search, 
  Menu, 
  ChevronDown, 
  LogOut, 
  User, 
  Building,
  Shield,
  CheckCircle2
} from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute breadcrumbs
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path === '/vendors') return 'Vendor Management';
    if (path === '/rfqs') return 'Request for Quotations';
    if (path === '/quotations') return 'Quotations Management';
    if (path === '/approvals') return 'Workflow Approvals';
    if (path === '/purchase-orders') return 'Purchase Orders';
    if (path === '/invoices') return 'Invoice & Payments';
    if (path === '/reports') return 'Reports & Analytics';
    if (path === '/activity') return 'System Audit Trail';
    return 'VendorBridge';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mockAlerts = [
    { id: 1, title: 'PO #8845 requires approval', type: 'warning', time: '10m ago' },
    { id: 2, title: 'Zenith Energy submitted quotation', type: 'info', time: '1h ago' },
    { id: 3, title: 'Compliance doc verified for Apex Metals', type: 'success', time: '4h ago' }
  ];

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-900/60 px-5 flex items-center justify-between sticky top-0 z-30">
      {/* Left Section: Breadcrumb & Menu Toggle */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">
            Procurement Console
          </span>
          <h1 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-wide mt-0.5">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-4">
        {/* Mock Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search records, RFQs, vendors..." 
            className="bg-zinc-900 border border-zinc-800 text-xs rounded-lg pl-9 pr-3 py-2 text-zinc-200 placeholder-zinc-500 outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 w-64 transition-all"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800/80 transition-all cursor-pointer relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden py-1 z-50">
              <div className="px-4 py-2.5 border-b border-zinc-900/60 flex justify-between items-center bg-zinc-950">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Notifications</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-900 px-1.5 py-0.5 rounded font-bold">3 New</span>
              </div>
              <div className="divide-y divide-zinc-900/60 max-h-64 overflow-y-auto">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="p-3.5 hover:bg-zinc-900/30 transition-colors flex flex-col gap-1 cursor-pointer">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-zinc-200">{alert.title}</span>
                      <span className="text-[10px] text-zinc-500 shrink-0 ml-2">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-zinc-900/60 text-center bg-zinc-950">
                <button 
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/reports'); // Dynamic navigation matching Chunk 5 Reports/Logs
                  }}
                  className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline py-1 w-full text-center cursor-pointer"
                >
                  View all logs & activity
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg bg-zinc-900/40 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800/80 transition-all cursor-pointer"
          >
            <div className="w-7.5 h-7.5 rounded-md bg-cyan-950 border border-cyan-900/60 flex items-center justify-center font-bold text-xs text-cyan-400 shrink-0">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'AD'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-zinc-200 truncate max-w-[120px]">
                {user?.name || 'Administrator'}
              </div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                {user?.role || 'Admin'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden py-1.5 z-50">
              {/* User Bio Header */}
              <div className="px-4 py-3 border-b border-zinc-900/60 bg-zinc-950 flex flex-col gap-1.5">
                <div className="text-xs font-bold text-zinc-200">{user?.name}</div>
                <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-cyan-500" />
                  <span>{user?.email}</span>
                </div>
                <div className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                  <Building className="w-3 h-3 text-cyan-500" />
                  <span>{user?.company}</span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Console</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
