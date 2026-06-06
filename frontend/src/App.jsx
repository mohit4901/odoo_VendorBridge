import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComingSoon from './pages/ComingSoon';
import Vendors from './pages/Vendors';
import Rfqs from './pages/Rfqs';
import Quotations from './pages/Quotations';

import { RFQProvider } from './context/RFQContext/RFQContext';

function App() {
  return (
    <AuthProvider>
      <RFQProvider>
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
            <Route 
              path="approvals" 
              element={<ComingSoon moduleName="Workflow Approvals" chunkDescription="Chunk 4: Approval & Invoice" />} 
            />
            <Route 
              path="purchase-orders" 
              element={<ComingSoon moduleName="Purchase Orders" chunkDescription="Chunk 4: Approval & Invoice" />} 
            />
            <Route 
              path="invoices" 
              element={<ComingSoon moduleName="Invoice & Payments" chunkDescription="Chunk 4: Approval & Invoice" />} 
            />
            <Route 
              path="reports" 
              element={<ComingSoon moduleName="Reports & Analytics" chunkDescription="Chunk 5: Reports & Activity" />} 
            />
            <Route 
              path="activity" 
              element={<ComingSoon moduleName="System Audit Trail" chunkDescription="Chunk 5: Reports & Activity" />} 
            />
          </Route>

          {/* Wildcard redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RFQProvider>
    </AuthProvider>
  );
}

export default App;
