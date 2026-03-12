import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const API_BASE = 'http://localhost:3001/api';

function MainDashboard() {
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/main/summary`).then(r => r.json()),
      fetch(`${API_BASE}/main/timeseries`).then(r => r.json())
    ]).then(([summaryData, timeseriesData]) => {
      setSummary(summaryData);
      setTimeseries(timeseriesData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch:', err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="dashboard"><p>Loading...</p></div>;
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📊 Quanta Dashboard</h1>
        <p>Real-time agent metrics</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Sessions Today</span>
          <span className="stat-value">{summary?.sessions || 0}</span>
          <span className={`stat-change ${summary?.sessionChange >= 0 ? 'positive' : 'negative'}`}>
            {summary?.sessionChange >= 0 ? '+' : ''}{summary?.sessionChange || 0}%
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tokens Today</span>
          <span className="stat-value">{formatNumber(summary?.tokens || 0)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Cost Today</span>
          <span className="stat-value">${(summary?.cost || 0).toFixed(2)}</span>
          <span className={`stat-change ${summary?.costChange >= 0 ? 'positive' : 'negative'}`}>
            {summary?.costChange >= 0 ? '+' : ''}{summary?.costChange || 0}%
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Agents</span>
          <span className="stat-value">{summary?.agents || 0}</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Today's Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeseries.length ? timeseries : []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" tick={{fontSize: 12}} />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                formatter={(value, name) => [formatNumber(value), name === 'sessions' ? 'Sessions' : name === 'tokens' ? 'Tokens' : name]}
              />
              <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fill="#3b82f633" strokeWidth={2} name="Sessions" />
              <Area type="monotone" dataKey="tokens" stroke="#22c55e" fill="#22c55e22" strokeWidth={2} name="Tokens" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
