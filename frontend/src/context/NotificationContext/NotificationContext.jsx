import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotificationsAndLogs = async () => {
    if (!user) return;
    try {
      const notifsRes = await api.get('/notifications');
      if (notifsRes.success && notifsRes.data) {
        setNotifications(notifsRes.data);
      }
      
      if (user.role === 'admin' || user.role === 'officer' || user.role === 'manager') {
        const logsRes = await api.get('/activity-logs');
        if (logsRes.success && logsRes.data) {
          setAuditLogs(logsRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications or logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsAndLogs();
  }, [user]);

  const addNotification = async (title, type = 'info') => {
    try {
      const localId = Date.now().toString();
      setNotifications(prev => [{ id: localId, title, type, read: false, createdAt: new Date() }, ...prev]);
      
      if (user && (user.role === 'admin' || user.role === 'officer' || user.role === 'manager')) {
        await api.post('/notifications', { title, type });
        await fetchNotificationsAndLogs();
      }
    } catch (err) {
      console.error('Failed to add notification:', err);
    }
  };

  const addAuditLog = async (title, desc, type = 'system', userName = 'System Bot') => {
    try {
      const localId = Date.now().toString();
      setAuditLogs(prev => [{ id: localId, title, desc, type, user: userName, createdAt: new Date() }, ...prev]);

      if (user && (user.role === 'admin' || user.role === 'officer' || user.role === 'manager')) {
        await api.post('/activity-logs', { title, desc, type, user: userName });
        await fetchNotificationsAndLogs();
      }
    } catch (err) {
      console.error('Failed to add audit log:', err);
    }
  };

  const clearNotification = async (id) => {
    try {
      setNotifications(prev => prev.filter(n => n._id !== id && n.id !== id));
      await api.delete(`/notifications/${id}`);
      await fetchNotificationsAndLogs();
    } catch (err) {
      console.error('Failed to clear notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      if (user && (user.role === 'admin' || user.role === 'officer' || user.role === 'manager')) {
        await api.delete('/notifications');
        await fetchNotificationsAndLogs();
      }
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      auditLogs,
      addNotification,
      addAuditLog,
      clearNotification,
      clearAllNotifications,
      loading,
      refresh: fetchNotificationsAndLogs
    }}>
      {children}
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
