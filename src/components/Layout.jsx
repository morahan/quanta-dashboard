import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './Layout.css';

function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('quanta_auth');
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <span>⚡ Quanta</span>
        </div>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>🚨</span> Alerts
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>📈</span> Analytics
          </NavLink>
          <NavLink to="/system" className={({ isActive }) => isActive ? 'active' : ''}>
            <span>🖥️</span> System
          </NavLink>
        </div>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span> Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
