import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const API_BASE = https://mighty-nights-grow.loca.lt/api/quanta;

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#3b82f6',
  info: '#06b6d4'
};

function AlertsDashboard() {
  const [summary, setSummary] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/alerts/summary`).then(r => r.json()),
      fetch(`${API_BASE}/alerts/recent`).then(r => r.json())
    ]).then(([summaryData, alertsData]) => {
      setSummary(summaryData);
      setAlerts(alertsData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch:', err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="dashboard"><p>Loading alerts...</p></div>;
  }

  const pieData = [
    { name: 'Critical', count: summary.critical, color: SEVERITY_COLORS.critical },
    { name: 'High', count: summary.high, color: SEVERITY_COLORS.high },
    { name: 'Medium', count: summary.medium, color: SEVERITY_COLORS.medium },
    { name: 'Low', count: summary.low, color: SEVERITY_COLORS.low },
  ].filter(d => d.count > 0);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🚨 Alerts Dashboard</h1>
        <p>System anomalies and notifications</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card critical">
          <span className="stat-label">Critical</span>
          <span className="stat-value">{summary.critical}</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-label">High</span>
          <span className="stat-value">{summary.high}</span>
        </div>
        <div className="stat-card info">
          <span className="stat-label">Medium</span>
          <span className="stat-value">{summary.medium}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value">{summary.total}</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Alerts by Severity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="count"
                nameKey="name"
                label={({name, count}) => `${name}: ${count}`}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pieData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" width={60} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Recent Anomalies</h3>
          <div className="alerts-list">
            {alerts.length === 0 ? (
              <div className="alert-item info">
                <span className="alert-message">No recent anomalies</span>
              </div>
            ) : (
              alerts.slice(0, 15).map((alert, idx) => (
                <div key={alert.id || idx} className={`alert-item ${alert.severity || 'info'}`}>
                  <span className={`severity-badge ${alert.severity || 'info'}`}>
                    {alert.severity || 'info'}
                  </span>
                  <span className="alert-message">
                    {alert.rule_name || alert.message || 'Unknown anomaly'}
                  </span>
                  <span className="alert-time">
                    {alert.timestamp?.slice(0, 16) || alert.date || ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertsDashboard;
