import React, { createContext, useContext, useState, useEffect } from 'react';
import approvalService from '../../services/approvalService';
import poService from '../../services/poService';
import { useNotifications } from '../NotificationContext/NotificationContext';
import { useAuth } from '../AuthContext';

const ApprovalContext = createContext(null);

export const ApprovalProvider = ({ children }) => {
  const [approvals, setApprovals] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification, addAuditLog } = useNotifications();
  const { user } = useAuth();

  const [onPoIssued, setOnPoIssued] = useState(null);

  const fetchApprovalsAndPOs = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const approvalsRes = await approvalService.list();
      if (approvalsRes.success && approvalsRes.data) {
        setApprovals(approvalsRes.data);
      }
      const posRes = await poService.list();
      if (posRes.success && posRes.data) {
        setPurchaseOrders(posRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch approvals or POs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalsAndPOs();
  }, [user]);

  const approveRequest = async (id, userRole = 'admin') => {
    try {
      const remark = 'Approved via UI Console';
      const res = await approvalService.approve(id, remark);
      if (res.success) {
        const approvalObj = approvals.find(a => (a._id || a.id) === id);
        const vendorName = approvalObj?.vendorName || 'Vendor';
        const amount = approvalObj?.amount || 0;

        if (approvalObj?.status === 'Manager Review') {
          addNotification(`PO Request for ${vendorName} advanced to Finance Approval`, 'info');
          addAuditLog(`Approval Advanced`, `PO request for ${vendorName} ($${amount.toLocaleString()}) approved by Manager, sent to Finance.`, 'po', user?.name || 'A. Sharma');
        } else {
          addNotification(`Purchase Order issued for ${vendorName}`, 'success');
          addAuditLog(`Purchase Order Issued`, `PO generated for ${vendorName} ($${amount.toLocaleString()}) after final Finance approval.`, 'po', user?.name || 'M. Mudgil');
          
          if (onPoIssued && res.data?.purchaseOrder) {
            onPoIssued(res.data.purchaseOrder);
          }
        }
        await fetchApprovalsAndPOs();
      }
    } catch (err) {
      console.error('Failed to approve request:', err);
      addNotification(err.message || 'Failed to approve request', 'error');
    }
  };

  const rejectRequest = async (id, userRole = 'admin') => {
    try {
      const remark = 'Rejected via UI Console';
      const res = await approvalService.reject(id, remark);
      if (res.success) {
        const approvalObj = approvals.find(a => (a._id || a.id) === id);
        const vendorName = approvalObj?.vendorName || 'Vendor';
        const amount = approvalObj?.amount || 0;

        addNotification(`PO Request for ${vendorName} Rejected`, 'warning');
        addAuditLog(`PO Request Rejected`, `PO request for ${vendorName} ($${amount.toLocaleString()}) was rejected.`, 'po', user?.name || 'Console Administrator');
        await fetchApprovalsAndPOs();
      }
    } catch (err) {
      console.error('Failed to reject request:', err);
      addNotification(err.message || 'Failed to reject request', 'error');
    }
  };

  const addApprovalRequest = async (rfqId, title, vendorId, vendorName, amount, items) => {
    try {
      const res = await approvalService.create({
        rfqId,
        rfqTitle: title,
        vendorId,
        vendorName,
        amount,
        items: items.map(item => ({
          name: item.name,
          qty: item.qty,
          price: item.price || 0
        }))
      });
      if (res.success) {
        await fetchApprovalsAndPOs();
        addNotification(`New approval workflow generated for "${title}"`, 'info');
        addAuditLog(`Workflow Started`, `Approval process initialized for awarded contract to ${vendorName} ($${amount.toLocaleString()}).`, 'po', 'System Bot');
      }
    } catch (err) {
      console.error('Failed to create approval request:', err);
    }
  };

  return (
    <ApprovalContext.Provider value={{ 
      approvals, 
      purchaseOrders, 
      approveRequest, 
      rejectRequest, 
      addApprovalRequest, 
      setOnPoIssued, 
      loading,
      refresh: fetchApprovalsAndPOs
    }}>
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApprovals = () => {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error('useApprovals must be used within an ApprovalProvider');
  }
  return context;
};
