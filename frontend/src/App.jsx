import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext/NotificationContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';
import Vendors from './pages/Vendors';
import Rfqs from './pages/Rfqs';
import Quotations from './pages/Quotations';

import { RFQProvider } from './context/RFQContext/RFQContext';
import { ApprovalProvider, useApprovals } from './context/ApprovalContext/ApprovalContext';
import { InvoiceProvider, useInvoices } from './context/InvoiceContext/InvoiceContext';
import { useEffect } from 'react';

// Sync component to link PO emission to Invoice generation
const WorkflowSync = ({ children }) => {
  const { setOnPoIssued } = useApprovals();
  const { createInvoiceFromPo } = useInvoices();

  useEffect(() => {
    setOnPoIssued(() => (po) => {
      createInvoiceFromPo(po);
    });
  }, [createInvoiceFromPo, setOnPoIssued]);

  return children;
};

import Approvals from './pages/Approvals';
import PurchaseOrders from './pages/PurchaseOrders';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports/Reports';
import ActivityLogs from './pages/ActivityLogs/ActivityLogs';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RFQProvider>
          <ApprovalProvider>
            <InvoiceProvider>
              <WorkflowSync>
                <Routes>
                  {/* Auth routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected layout routes */}
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="vendors" element={<Vendors />} />
                    <Route path="rfqs" element={<Rfqs />} />
                    <Route path="quotations" element={<Quotations />} />
                    <Route path="approvals" element={<Approvals />} />
                    <Route path="purchase-orders" element={<PurchaseOrders />} />
                    <Route path="invoices" element={<Invoices />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="activity" element={<ActivityLogs />} />
                  </Route>

                  {/* Wildcard redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </WorkflowSync>
            </InvoiceProvider>
          </ApprovalProvider>
        </RFQProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
