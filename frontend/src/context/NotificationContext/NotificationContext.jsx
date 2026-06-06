import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext(null);

const initialNotifications = [
  { id: 1, title: 'PO #8845 requires approval', type: 'warning', time: '10m ago', read: false },
  { id: 2, title: 'Zenith Energy submitted quotation', type: 'info', time: '1h ago', read: false },
  { id: 3, title: 'Compliance doc verified for Apex Metals', type: 'success', time: '4h ago', read: false }
];

const initialAuditLogs = [
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

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load notifications
    const savedNotifications = localStorage.getItem('vb_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      localStorage.setItem('vb_notifications', JSON.stringify(initialNotifications));
      setNotifications(initialNotifications);
    }

    // Load audit logs
    const savedLogs = localStorage.getItem('vb_audit_logs');
    if (savedLogs) {
      setAuditLogs(JSON.parse(savedLogs));
    } else {
      localStorage.setItem('vb_audit_logs', JSON.stringify(initialAuditLogs));
      setAuditLogs(initialAuditLogs);
    }

    setLoading(false);
  }, []);

  const saveNotifications = (updated) => {
    setNotifications(updated);
    localStorage.setItem('vb_notifications', JSON.stringify(updated));
  };

  const saveAuditLogs = (updated) => {
    setAuditLogs(updated);
    localStorage.setItem('vb_audit_logs', JSON.stringify(updated));
  };

  // Add a real-time notification alert
  const addNotification = (title, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      type,
      time: 'Just now',
      read: false
    };
    saveNotifications([newNotif, ...notifications]);
  };

  // Add a system audit log record
  const addAuditLog = (title, desc, type = 'system', user = 'System Bot') => {
    const newLog = {
      id: Date.now(),
      title,
      desc,
      type,
      time: 'Just now',
      user
    };
    saveAuditLogs([newLog, ...auditLogs]);
  };

  // Clear single notification
  const clearNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  // Clear all audit logs
  const clearAllAuditLogs = () => {
    saveAuditLogs([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      auditLogs,
      addNotification,
      addAuditLog,
      clearNotification,
      clearAllNotifications,
      clearAllAuditLogs,
      loading
    }}>
      {!loading && children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
