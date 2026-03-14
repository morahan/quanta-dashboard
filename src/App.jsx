import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import MainDashboard from './pages/MainDashboard';
import NowDashboard from './pages/NowDashboard';
import TokensDashboard from './pages/TokensDashboard';
import CostsDashboard from './pages/CostsDashboard';
import ModelsDashboard from './pages/ModelsDashboard';
import GPUDashboard from './pages/GPUDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SystemDashboard from './pages/SystemDashboard';
import AlertsDashboard from './pages/AlertsDashboard';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('quanta_auth');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Outlet />
            </Layout>
          </ProtectedRoute>
        }>
          <Route index element={<MainDashboard />} />
          <Route path="now" element={<NowDashboard />} />
          <Route path="tokens" element={<TokensDashboard />} />
          <Route path="costs" element={<CostsDashboard />} />
          <Route path="models" element={<ModelsDashboard />} />
          <Route path="gpu" element={<GPUDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="system" element={<SystemDashboard />} />
          <Route path="alerts" element={<AlertsDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
