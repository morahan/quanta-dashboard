import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend } from 'recharts';
import './Dashboard.css';

const API_BASE = 'http://localhost:3001/api';

function TokensDashboard() {
  const [dailyTokens, setDailyTokens] = useState([]);
  const [agentTokens, setAgentTokens] = useState([]);
  const [modelTokens, setModelTokens] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/analytics/daily?days=${days}`).then(r => r.json()),
      fetch(`${API_BASE}/analytics/agents?days=${days}`).then(r => r.json()),
      fetch(`${API_BASE}/analytics/models?days=${days}`).then(r => r.json())
    ]).then(([daily, agents, models]) => {
      setDailyTokens(daily);
      setAgentTokens(agents);
      setModelTokens(models);
      
      const total = daily.reduce((sum, d) => sum + (d.tokens || 0), 0);
      const avg = daily.length ? total / daily.length : 0;
      setSummary({ total, avg, days: daily.length });
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch:', err);
      setLoading(false);
    });
  }, [days]);

  if (loading) {
    return <div className="dashboard"><p className="loading">Loading token metrics...</p></div>;
  }

  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return (num || 0).toString();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1><span>◈</span> Tokens</h1>
        <p>
          Token usage analytics • Denver timezone (MST)
          <span className="time-range-selector">
            <button className={days === 7 ? 'active' : ''} onClick={() => setDays(7)}>7D</button>
            <button className={days === 14 ? 'active' : ''} onClick={() => setDays(14)}>14D</button>
            <button className={days === 30 ? 'active' : ''} onClick={() => setDays(30)}>30D</button>
          </span>
        </p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Tokens</span>
          <span className="stat-value">{formatNumber(summary?.total || 0)}</span>
          <span className="stat-change positive">{days} days</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg/Day</span>
          <span className="stat-value">{formatNumber(summary?.avg || 0)}</span>
          <span className="stat-change positive">tokens</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Peak Day</span>
          <span className="stat-value">{formatNumber(Math.max(...dailyTokens.map(d => d.tokens || 0)))}</span>
          <span className="stat-change">max</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Days Tracked</span>
          <span className="stat-value">{summary?.days || 0}</span>
          <span className="stat-change positive">active</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Token Usage Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyTokens}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 11}} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="#64748b" tick={{fontSize: 11}} tickFormatter={(v) => formatNumber(v)} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value) => [formatNumber(value), 'Tokens']}
              />
              <Area type="monotone" dataKey="tokens" stroke="#00d4ff" fillOpacity={1} fill="url(#colorTokens)" strokeWidth={2} name="Tokens" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Token Usage by Agent ({days} days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={agentTokens.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#64748b" tickFormatter={(v) => formatNumber(v)} />
              <YAxis type="category" dataKey="agent" stroke="#64748b" width={70} tick={{fontSize: 11}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value) => [formatNumber(value), 'Tokens']}
              />
              <Bar dataKey="tokens" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Token Usage by Model ({days} days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={modelTokens.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#64748b" tickFormatter={(v) => formatNumber(v)} />
              <YAxis type="category" dataKey="model" stroke="#64748b" width={80} tick={{fontSize: 10}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value) => [formatNumber(value), 'Tokens']}
              />
              <Bar dataKey="tokens" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default TokensDashboard;
