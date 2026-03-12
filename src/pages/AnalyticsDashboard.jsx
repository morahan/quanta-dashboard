import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const API_BASE = 'http://localhost:3001/api';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

function AnalyticsDashboard() {
  const [daily, setDaily] = useState([]);
  const [agents, setAgents] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(14);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/analytics/daily?days=${days}`).then(r => r.json()),
      fetch(`${API_BASE}/analytics/agents?days=${days}`).then(r => r.json()),
      fetch(`${API_BASE}/analytics/models?days=${days}`).then(r => r.json())
    ]).then(([dailyData, agentsData, modelsData]) => {
      setDaily(dailyData);
      setAgents(agentsData);
      setModels(modelsData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch:', err);
      setLoading(false);
    });
  }, [days]);

  if (loading) {
    return <div className="dashboard"><p className="loading">Loading analytics...</p></div>;
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return (num || 0).toString();
  };

  // Calculate totals
  const totalSessions = daily.reduce((sum, d) => sum + d.sessions, 0);
  const totalTokens = daily.reduce((sum, d) => sum + d.tokens, 0);
  const totalCost = daily.reduce((sum, d) => sum + d.cost, 0);
  const avgSessions = daily.length ? Math.round(totalSessions / daily.length) : 0;
  
  const dateRange = daily.length ? `${daily[0]?.date} → ${daily[daily.length-1]?.date}` : 'No data';

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1><span>◈</span> Analytics</h1>
        <p>
          {dateRange} • Denver timezone (MST)
          <span className="time-range-selector">
            <button className={days === 7 ? 'active' : ''} onClick={() => setDays(7)}>7D</button>
            <button className={days === 14 ? 'active' : ''} onClick={() => setDays(14)}>14D</button>
            <button className={days === 30 ? 'active' : ''} onClick={() => setDays(30)}>30D</button>
          </span>
        </p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Sessions</span>
          <span className="stat-value">{formatNumber(totalSessions)}</span>
          <span className="stat-change positive">{days} days</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Tokens</span>
          <span className="stat-value">{formatNumber(totalTokens)}</span>
          <span className="stat-change positive">✓</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Cost</span>
          <span className="stat-value">${totalCost.toFixed(2)}</span>
          <span className="stat-change positive">{days}-day</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg/Day</span>
          <span className="stat-value">{avgSessions}</span>
          <span className="stat-change positive">sessions</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Daily Sessions ({days} Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{fontSize: 11}} 
                tickFormatter={(d) => d.slice(5)} 
              />
              <YAxis stroke="#64748b" tick={{fontSize: 11}} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [formatNumber(value), name === 'sessions' ? 'Sessions' : name === 'agents' ? 'Agents' : name]}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#00d4ff" 
                strokeWidth={2} 
                dot={{fill: '#00d4ff', strokeWidth: 0, r: 3}}
                name="Sessions" 
              />
              <Line 
                type="monotone" 
                dataKey="agents" 
                stroke="#22c55e" 
                strokeWidth={2} 
                dot={{fill: '#22c55e', strokeWidth: 0, r: 3}}
                name="Agents" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Cost by Agent ({days} days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agents.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="agent" stroke="#64748b" width={60} tick={{fontSize: 11}} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
              />
              <Bar dataKey="cost" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Model Usage ({days} days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={models}
                dataKey="cost"
                nameKey="model"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({model, percent}) => `${model?.slice(0,12) || '?'} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {models.map((entry, index) => (
                  <Cell key={entry.model} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Agent Performance (TPS)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agents.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis type="category" dataKey="agent" stroke="#64748b" width={60} tick={{fontSize: 11}} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value) => [value || 0, 'Avg TPS']}
              />
              <Bar dataKey="avg_tps" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Avg TPS" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
