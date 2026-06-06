import React, { createContext, useContext, useState, useEffect } from 'react';

const InvoiceContext = createContext(null);

const initialInvoices = [
  {
    id: 1,
    invoiceRef: 'INV-2026-8843',
    poRef: 'PO-2026-8843',
    vendorName: 'Apex Metals Inc.',
    subtotal: 120000,
    tax: 21600, // 18% GST
    total: 141600,
    status: 'Pending Payment', // Pending Payment -> Paid
    date: '2026-06-04',
    dueDate: '2026-07-04',
    items: [
      { name: 'Structural Steel H-Beams', qty: 100, price: 1200 }
    ]
  }
];

export const InvoiceProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedInvoices = localStorage.getItem('vb_invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else {
      localStorage.setItem('vb_invoices', JSON.stringify(initialInvoices));
      setInvoices(initialInvoices);
    }
    setLoading(false);
  }, []);

  const saveInvoices = (updated) => {
    setInvoices(updated);
    localStorage.setItem('vb_invoices', JSON.stringify(updated));
  };

  const createInvoiceFromPo = (po) => {
    const subtotal = po.amount;
    const tax = Math.round(subtotal * 0.18); // 18% tax
    const total = subtotal + tax;
    
    // Compute due date (30 days from PO issue date)
    const issueDate = new Date(po.date);
    issueDate.setDate(issueDate.getDate() + 30);
    const dueDateStr = issueDate.toISOString().split('T')[0];

    const newInvoice = {
      id: Date.now(),
      invoiceRef: `INV-2026-${po.poRef.slice(-4)}`,
      poRef: po.poRef,
      vendorName: po.vendorName,
      subtotal,
      tax,
      total,
      status: 'Pending Payment',
      date: po.date,
      dueDate: dueDateStr,
      items: po.items
    };

    const updated = [newInvoice, ...invoices];
    saveInvoices(updated);
    return newInvoice;
  };

  const payInvoice = (id) => {
    const updated = invoices.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status: 'Paid'
        };
      }
      return inv;
    });
    saveInvoices(updated);
  };

  return (
    <InvoiceContext.Provider value={{ invoices, createInvoiceFromPo, payInvoice, loading }}>
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
