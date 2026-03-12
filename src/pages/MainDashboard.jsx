import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './Dashboard.css';

const sampleData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  value: Math.floor(Math.random() * 5000) + 2000,
  requests: Math.floor(Math.random() * 1000) + 500,
}));

function MainDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulated real-time data
    const interval = setInterval(() => {
      const now = new Date();
      setData(prev => {
        const newData = [...prev, {
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.floor(Math.random() * 5000) + 2000,
          requests: Math.floor(Math.random() * 1000) + 500,
        }].slice(-20);
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 Quanta Dashboard</h1>
        <p>Real-time analytics overview</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Requests</span>
          <span className="stat-value">1.2M</span>
          <span className="stat-change positive">+12.5%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Response</span>
          <span className="stat-value">142ms</span>
          <span className="stat-change positive">-8.2%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Error Rate</span>
          <span className="stat-value">0.12%</span>
          <span className="stat-change positive">-0.05%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Users</span>
          <span className="stat-value">847</span>
          <span className="stat-change positive">+23</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Real-time Traffic</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.length ? data : sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f633" strokeWidth={2} />
              <Area type="monotone" dataKey="requests" stroke="#22c55e" fill="#22c55e22" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
