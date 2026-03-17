import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const API_BASE = https://public-rooms-smash.loca.lt/api/quanta;

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
    return <div className="dashboard"><p className="loading">Loading metrics...</p></div>;
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatTime = (time) => {
    if (!time) return '';
    const parts = time.split(' ');
    if (parts.length >= 2) return parts[1]?.slice(0, 5) || '';
    return time.slice(0, 5);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1><span>◉</span> Overview</h1>
        <p>Rolling 24 hours • Denver timezone (MST)</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Sessions (24h)</span>
          <span className="stat-value">{summary?.sessions || 0}</span>
          <span className={`stat-change ${summary?.sessionChange >= 0 ? 'positive' : 'negative'}`}>
            {summary?.sessionChange >= 0 ? '↑' : '↓'} {Math.abs(summary?.sessionChange || 0)}% vs prev 24h
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tokens Processed</span>
          <span className="stat-value">{formatNumber(summary?.tokens)}</span>
          <span className="stat-change positive">✓ Recorded</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">API Cost</span>
          <span className="stat-value">${(summary?.cost || 0).toFixed(2)}</span>
          <span className={`stat-change ${summary?.costChange >= 0 ? 'positive' : 'negative'}`}>
            {summary?.costChange >= 0 ? '↑' : '↓'} {Math.abs(summary?.costChange || 0)}% vs prev 24h
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Agents</span>
          <span className="stat-value">{summary?.agents || 0}</span>
          <span className="stat-change positive">Running</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Activity Timeline • Last 24 Hours</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={timeseries.length ? timeseries : []}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                tick={{fontSize: 11, fontFamily: 'JetBrains Mono'}} 
                tickFormatter={formatTime}
              />
              <YAxis 
                stroke="#64748b" 
                tick={{fontSize: 11, fontFamily: 'JetBrains Mono'}}
                tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [
                  name === 'sessions' ? formatNumber(value) : formatNumber(value),
                  name === 'sessions' ? 'Sessions' : 'Tokens'
                ]}
                labelFormatter={(label) => `Time: ${formatTime(label)}`}
              />
              <Area 
                type="monotone" 
                dataKey="sessions" 
                stroke="#00d4ff" 
                fillOpacity={1} 
                fill="url(#colorSessions)" 
                strokeWidth={2} 
                name="sessions"
                animationDuration={1000}
              />
              <Area 
                type="monotone" 
                dataKey="tokens" 
                stroke="#a855f7" 
                fillOpacity={1} 
                fill="url(#colorTokens)" 
                strokeWidth={2} 
                name="tokens"
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default MainDashboard;
