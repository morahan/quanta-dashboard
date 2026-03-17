import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import './Dashboard.css';

const API_BASE = https://public-rooms-smash.loca.lt/api/quanta;

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#14b8a6', '#f97316'];

function ModelsDashboard() {
  const [models, setModels] = useState([]);
  const [modelEvents, setModelEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/analytics/models?days=${days}`).then(r => r.json()),
      // Fetch model transitions/events from database
      fetch(`${API_BASE}/system/gpu?hours=${days * 24}`).then(r => r.json())
    ]).then(([modelsData, gpuData]) => {
      setModels(modelsData);
      
      // Calculate summary
      const totalSessions = modelsData.reduce((sum, m) => sum + (m.sessions || 0), 0);
      const totalTokens = modelsData.reduce((sum, m) => sum + (m.tokens || 0), 0);
      const totalCost = modelsData.reduce((sum, m) => sum + (m.cost || 0), 0);
      
      // Estimate VRAM hours from GPU data
      const vramHours = gpuData.length * 0.25; // rough estimate
      
      setSummary({
        totalSessions,
        totalTokens,
        totalCost,
        modelCount: modelsData.length,
        vramHours: vramHours.toFixed(1)
      });
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch:', err);
      // Fallback to basic model data
      fetch(`${API_BASE}/analytics/models?days=${days}`)
        .then(r => r.json())
        .then(data => {
          setModels(data);
          const totalSessions = data.reduce((sum, m) => sum + (m.sessions || 0), 0);
          const totalCost = data.reduce((sum, m) => sum + (m.cost || 0), 0);
          setSummary({ totalSessions, totalCost, modelCount: data.length, vramHours: 'N/A' });
          setLoading(false);
        });
    });
  }, [days]);

  if (loading) {
    return <div className="dashboard"><p className="loading">Loading model metrics...</p></div>;
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return (num || 0).toString();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1><span>◉</span> Models</h1>
        <p>
          Model usage analytics • Denver timezone (MST)
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
          <span className="stat-value">{formatNumber(summary?.totalSessions || 0)}</span>
          <span className="stat-change positive">{days} days</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Tokens</span>
          <span className="stat-value">{formatNumber(summary?.totalTokens || 0)}</span>
          <span className="stat-change positive">processed</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Cost</span>
          <span className="stat-value">${(summary?.totalCost || 0).toFixed(2)}</span>
          <span className="stat-change">API</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Unique Models</span>
          <span className="stat-value">{summary?.modelCount || 0}</span>
          <span className="stat-change positive">active</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Session Distribution by Model</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={models}
                dataKey="sessions"
                nameKey="model"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({model, percent}) => `${model?.slice(0,12) || '?'} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {models.map((entry, index) => (
                  <Cell key={entry.model} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value) => [formatNumber(value), 'Sessions']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Token Distribution by Model</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={models}
                dataKey="tokens"
                nameKey="model"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({model, percent}) => `${model?.slice(0,12) || '?'} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {models.map((entry, index) => (
                  <Cell key={entry.model} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value) => [formatNumber(value), 'Tokens']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Model Cost Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={models.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `$${v.toFixed(2)}`} />
              <YAxis type="category" dataKey="model" stroke="#64748b" width={120} tick={{fontSize: 10}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
              />
              <Bar dataKey="cost" fill="#f97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Model Sessions Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={models.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#64748b" tickFormatter={(v) => formatNumber(v)} />
              <YAxis type="category" dataKey="model" stroke="#64748b" width={120} tick={{fontSize: 10}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value) => [formatNumber(value), 'Sessions']}
              />
              <Bar dataKey="sessions" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ModelsDashboard;
