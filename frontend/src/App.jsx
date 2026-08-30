import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InvoiceUpload from './pages/InvoiceUpload';
import InvoiceList from './pages/InvoiceList';
import InvoiceDetail from './pages/InvoiceDetail';
import ExceptionCenter from './pages/ExceptionCenter';
import PurchaseOrders from './pages/PurchaseOrders';
import GRNManagement from './pages/GRNManagement';
import FraudCenter from './pages/FraudCenter';
import VendorAnalytics from './pages/VendorAnalytics';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#edf3f4] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-600">Initializing FraudLens AI Security Context...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#edf3f4] text-slate-800 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto bg-[#eef3f5]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/upload" element={<ProtectedLayout><InvoiceUpload /></ProtectedLayout>} />
          <Route path="/invoices" element={<ProtectedLayout><InvoiceList /></ProtectedLayout>} />
          <Route path="/invoices/:id" element={<ProtectedLayout><InvoiceDetail /></ProtectedLayout>} />
          <Route path="/exceptions" element={<ProtectedLayout><ExceptionCenter /></ProtectedLayout>} />
          <Route path="/purchase-orders" element={<ProtectedLayout><PurchaseOrders /></ProtectedLayout>} />
          <Route path="/grn" element={<ProtectedLayout><GRNManagement /></ProtectedLayout>} />
          <Route path="/fraud-center" element={<ProtectedLayout><FraudCenter /></ProtectedLayout>} />
          <Route path="/vendor-analytics" element={<ProtectedLayout><VendorAnalytics /></ProtectedLayout>} />
          <Route path="/audit-logs" element={<ProtectedLayout><AuditLogs /></ProtectedLayout>} />
          <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
