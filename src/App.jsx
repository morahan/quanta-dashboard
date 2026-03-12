import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainDashboard from './pages/MainDashboard';
import AlertsDashboard from './pages/AlertsDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import SystemDashboard from './pages/SystemDashboard';
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
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<MainDashboard />} />
          <Route path="alerts" element={<AlertsDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="system" element={<SystemDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
