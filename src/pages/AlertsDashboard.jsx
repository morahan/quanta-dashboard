import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const alertData = [
  { name: 'Critical', count: 3, color: '#ef4444' },
  { name: 'Warning', count: 12, color: '#f59e0b' },
  { name: 'Info', count: 45, color: '#3b82f6' },
];

const recentAlerts = [
  { id: 1, severity: 'critical', message: 'High CPU usage on server-01', time: '2 min ago' },
  { id: 2, severity: 'warning', message: 'Memory usage above 80%', time: '5 min ago' },
  { id: 3, severity: 'info', message: 'Scheduled backup completed', time: '15 min ago' },
  { id: 4, severity: 'warning', message: 'Disk space below threshold', time: '30 min ago' },
  { id: 5, severity: 'critical', message: 'Database connection failed', time: '45 min ago' },
];

function AlertsDashboard() {
  const [alerts] = useState(recentAlerts);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🚨 Alerts Dashboard</h1>
        <p>System alerts and notifications</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card critical">
          <span className="stat-label">Critical</span>
          <span className="stat-value">3</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-label">Warnings</span>
          <span className="stat-value">12</span>
        </div>
        <div className="stat-card info">
          <span className="stat-label">Info</span>
          <span className="stat-value">45</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Today</span>
          <span className="stat-value">60</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Alerts by Severity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={alertData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="count"
              >
                {alertData.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Weekly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { day: 'Mon', alerts: 12 },
              { day: 'Tue', alerts: 19 },
              { day: 'Wed', alerts: 8 },
              { day: 'Thu', alerts: 15 },
              { day: 'Fri', alerts: 22 },
              { day: 'Sat', alerts: 5 },
              { day: 'Sun', alerts: 3 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="alerts" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Recent Alerts</h3>
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-item ${alert.severity}`}>
                <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertsDashboard;
