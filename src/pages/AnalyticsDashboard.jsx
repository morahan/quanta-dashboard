import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './Dashboard.css';

const pageViewsData = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  views: Math.floor(Math.random() * 10000) + 5000,
  unique: Math.floor(Math.random() * 5000) + 2000,
}));

function AnalyticsDashboard() {
  const [data, setData] = useState(pageViewsData);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📈 Analytics Dashboard</h1>
        <p>Traffic and user analytics</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Page Views</span>
          <span className="stat-value">89.2K</span>
          <span className="stat-change positive">+18.2%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Unique Visitors</span>
          <span className="stat-value">24.7K</span>
          <span className="stat-change positive">+12.4%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Session</span>
          <span className="stat-value">4m 32s</span>
          <span className="stat-change positive">+0.8%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Bounce Rate</span>
          <span className="stat-value">32.1%</span>
          <span className="stat-change negative">+2.3%</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Page Views (14 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Views" />
              <Line type="monotone" dataKey="unique" stroke="#22c55e" strokeWidth={2} dot={false} name="Unique" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Top Pages</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { page: '/', views: 12500 },
              { page: '/dashboard', views: 8200 },
              { page: '/analytics', views: 6100 },
              { page: '/settings', views: 3200 },
              { page: '/profile', views: 2800 },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis type="category" dataKey="page" stroke="#9ca3af" width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="views" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { source: 'Direct', users: 8500 },
              { source: 'Search', users: 6200 },
              { source: 'Social', users: 4100 },
              { source: 'Referral', users: 2800 },
              { source: 'Email', users: 1500 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="source" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="users" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
