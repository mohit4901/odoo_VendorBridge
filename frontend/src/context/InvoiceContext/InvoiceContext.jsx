import React, { createContext, useContext, useState, useEffect } from 'react';
import invoiceService from '../../services/invoiceService';
import { useNotifications } from '../NotificationContext/NotificationContext';
import { useAuth } from '../AuthContext';

const InvoiceContext = createContext(null);

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification, addAuditLog } = useNotifications();
  const { user } = useAuth();

  const fetchInvoices = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await invoiceService.list();
      if (res.success && res.data) {
        setInvoices(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const createInvoiceFromPo = async (po) => {
    try {
      const res = await invoiceService.generate({ poId: po._id || po.id });
      if (res.success) {
        const invoiceRef = res.data?.invoiceRef || 'INV';
        addNotification(`Invoice generated for ${po.vendorName}`, 'info');
        addAuditLog(`Invoice Generated`, `Invoice ${invoiceRef} generated automatically from ${po.poRef} (${po.vendorName}).`, 'invoice', 'System Bot');
        await fetchInvoices();
        return res.data;
      }
    } catch (err) {
      console.error('Failed to generate invoice from PO:', err);
    }
  };

  const payInvoice = async (id) => {
    try {
      const res = await invoiceService.pay(id);
      if (res.success) {
        const inv = invoices.find(i => (i._id || i.id) === id);
        const invRef = inv?.invoiceRef || 'INV';
        const vendor = inv?.vendorName || 'Vendor';
        const total = inv?.total || 0;

        addNotification(`Invoice ${invRef} paid successfully`, 'success');
        addAuditLog(`Invoice Paid`, `Invoice ${invRef} for ${vendor} ($${total.toLocaleString()}) marked as paid.`, 'invoice', user?.name || 'Console Administrator');
        await fetchInvoices();
      }
    } catch (err) {
      console.error('Failed to pay invoice:', err);
      addNotification(err.message || 'Failed to process payment', 'error');
    }
  };

  return (
    <InvoiceContext.Provider value={{ invoices, createInvoiceFromPo, payInvoice, loading, refresh: fetchInvoices }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};
