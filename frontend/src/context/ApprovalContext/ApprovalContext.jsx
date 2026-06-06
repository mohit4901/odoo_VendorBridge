import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from '../NotificationContext/NotificationContext';
import { useAuth } from '../AuthContext';

const ApprovalContext = createContext(null);

const initialApprovals = [
  {
    id: 1,
    rfqId: 1,
    rfqTitle: 'Office Furniture Procurement',
    vendorId: 1,
    vendorName: 'Apex Supplies Ltd.',
    amount: 16250,
    status: 'Manager Review', // Manager Review -> Finance Approval -> Issued
    history: [
      { step: 'Draft Generated', user: 'System Bot', time: '1 day ago', comment: 'RFQ awarded.' },
      { step: 'Submitted for Review', user: 'Jane Doe', time: '1 day ago', comment: 'Forwarded to Manager approval node.' }
    ],
    items: [
      { name: 'Ergonomic Office Chair', qty: 50, price: 150 },
      { name: 'Standing Desk (Dual Motor)', qty: 25, price: 350 }
    ]
  },
  {
    id: 2,
    rfqId: 2,
    rfqTitle: 'Raw Lithium Carbonate Supply',
    vendorId: 2,
    vendorName: 'Zenith Energy Solutions',
    amount: 118000,
    status: 'Manager Review',
    history: [
      { step: 'Draft Generated', user: 'System Bot', time: '5 hours ago', comment: 'RFQ awarded.' },
      { step: 'Submitted for Review', user: 'David Miller', time: '4 hours ago', comment: 'Forwarded to Manager approval node.' }
    ],
    items: [
      { name: 'Lithium Carbonate Powder', qty: 10, price: 11800 }
    ]
  }
];

const initialPOs = [
  {
    id: 8843,
    poRef: 'PO-2026-8843',
    rfqId: 99,
    rfqTitle: 'Structural Steel Columns',
    vendorName: 'Apex Metals Inc.',
    amount: 120000,
    status: 'Issued',
    date: '2026-06-04',
    items: [
      { name: 'Structural Steel H-Beams', qty: 100, price: 1200 }
    ]
  }
];

export const ApprovalProvider = ({ children }) => {
  const [approvals, setApprovals] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification, addAuditLog } = useNotifications();
  const { user } = useAuth();

  // Trigger function when PO is generated to notify invoice context
  const [onPoIssued, setOnPoIssued] = useState(null);

  useEffect(() => {
    const savedApprovals = localStorage.getItem('vb_approvals');
    if (savedApprovals) {
      setApprovals(JSON.parse(savedApprovals));
    } else {
      localStorage.setItem('vb_approvals', JSON.stringify(initialApprovals));
      setApprovals(initialApprovals);
    }

    const savedPOs = localStorage.getItem('vb_pos');
    if (savedPOs) {
      setPurchaseOrders(JSON.parse(savedPOs));
    } else {
      localStorage.setItem('vb_pos', JSON.stringify(initialPOs));
      setPurchaseOrders(initialPOs);
    }
    setLoading(false);
  }, []);

  const saveApprovals = (updated) => {
    setApprovals(updated);
    localStorage.setItem('vb_approvals', JSON.stringify(updated));
  };

  const savePOs = (updated) => {
    setPurchaseOrders(updated);
    localStorage.setItem('vb_pos', JSON.stringify(updated));
  };

  const approveRequest = (id, userRole = 'admin') => {
    let poGenerated = null;
    
    const updated = approvals.map(app => {
      if (app.id === id) {
        let nextStatus = app.status;
        const nowStr = 'Just now';
        const newHistory = [...app.history];

        if (app.status === 'Manager Review') {
          nextStatus = 'Finance Approval';
          newHistory.push({
            step: 'Manager Approved',
            user: userRole === 'admin' ? 'A. Sharma (Manager)' : 'Console Administrator',
            time: nowStr,
            comment: 'Details verified. Passed to Finance Node.'
          });

          // Dispatch notifications
          addNotification(`PO Request for ${app.vendorName} advanced to Finance Approval`, 'info');
          addAuditLog(`Approval Advanced`, `PO request for ${app.vendorName} ($${app.amount.toLocaleString()}) approved by Manager, sent to Finance.`, 'po', user?.name || 'A. Sharma');

        } else if (app.status === 'Finance Approval') {
          nextStatus = 'Issued';
          newHistory.push({
            step: 'Finance Approved & Issued',
            user: userRole === 'admin' ? 'M. Mudgil (Finance)' : 'Console Administrator',
            time: nowStr,
            comment: 'Funds allocated. Purchase Order issued.'
          });

          // Dispatch notifications
          addNotification(`Purchase Order issued for ${app.vendorName}`, 'success');
          addAuditLog(`Purchase Order Issued`, `PO generated for ${app.vendorName} ($${app.amount.toLocaleString()}) after final Finance approval.`, 'po', user?.name || 'M. Mudgil');

          // Generate PO
          poGenerated = {
            id: Date.now(),
            poRef: `PO-2026-${id.toString().slice(-2)}${Math.floor(10 + Math.random() * 90)}`,
            rfqId: app.rfqId,
            rfqTitle: app.rfqTitle,
            vendorName: app.vendorName,
            amount: app.amount,
            status: 'Issued',
            date: new Date().toISOString().split('T')[0],
            items: app.items
          };
        }

        return {
          ...app,
          status: nextStatus,
          history: newHistory
        };
      }
      return app;
    });

    saveApprovals(updated);

    if (poGenerated) {
      const newPOs = [poGenerated, ...purchaseOrders];
      savePOs(newPOs);
      // Callback to register Invoice
      if (onPoIssued) {
        onPoIssued(poGenerated);
      }
    }
  };

  const rejectRequest = (id, userRole = 'admin') => {
    const updated = approvals.map(app => {
      if (app.id === id) {
        const newHistory = [...app.history];
        newHistory.push({
          step: 'Rejected',
          user: 'Console Administrator',
          time: 'Just now',
          comment: 'Quotation cost rejected. Re-negotiation required.'
        });

        // Dispatch notifications
        addNotification(`PO Request for ${app.vendorName} Rejected`, 'warning');
        addAuditLog(`PO Request Rejected`, `PO request for ${app.vendorName} ($${app.amount.toLocaleString()}) was rejected.`, 'po', user?.name || 'Console Administrator');

        return {
          ...app,
          status: 'Rejected',
          history: newHistory
        };
      }
      return app;
    });
    saveApprovals(updated);
  };

  // Add awarded RFQ as a new approval workflow
  const addApprovalRequest = (rfqId, title, vendorId, vendorName, amount, items) => {
    const newApproval = {
      id: Date.now(),
      rfqId,
      rfqTitle: title,
      vendorId,
      vendorName,
      amount,
      status: 'Manager Review',
      history: [
        { step: 'Draft Generated', user: 'System Bot', time: 'Just now', comment: 'RFQ quotation awarded.' },
        { step: 'Submitted for Review', user: 'Jane Doe', time: 'Just now', comment: 'Forwarded to Manager approval node.' }
      ],
      items: items.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price || 0
      }))
    };
    saveApprovals([newApproval, ...approvals]);

    // Dispatch notifications
    addNotification(`New approval workflow generated for "${title}"`, 'info');
    addAuditLog(`Workflow Started`, `Approval process initialized for awarded contract to ${vendorName} ($${amount.toLocaleString()}).`, 'po', 'System Bot');
  };

  return (
    <ApprovalContext.Provider value={{ 
      approvals, 
      purchaseOrders, 
      approveRequest, 
      rejectRequest, 
      addApprovalRequest, 
      setOnPoIssued, 
      loading 
    }}>
      {!loading && children}
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
