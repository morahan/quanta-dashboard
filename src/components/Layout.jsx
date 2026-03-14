import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Overview', icon: '◉' },
    { path: '/now', label: 'Now', icon: '◐' },
    { path: '/tokens', label: 'Tokens', icon: '◈' },
    { path: '/costs', label: 'Costs', icon: '$' },
    { path: '/models', label: 'Models', icon: '◉' },
    { path: '/gpu', label: 'GPU', icon: '⚡' },
    { path: '/analytics', label: 'Analytics', icon: '◈' },
    { path: '/system', label: 'System', icon: '◉' },
    { path: '/alerts', label: 'Alerts', icon: '◈' },
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⏱</span>
            <span className="logo-text">QUANTA</span>
          </div>
          <span className="logo-subtitle">Metrics Engine</span>
        </div>
        
        <nav className="nav-menu">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>Live</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
