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

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/analytics/daily`).then(r => r.json()),
      fetch(`${API_BASE}/analytics/agents`).then(r => r.json()),
      fetch(`${API_BASE}/analytics/models`).then(r => r.json())
    ]).then(([dailyData, agentsData, modelsData]) => {
      setDaily(dailyData);
      setAgents(agentsData);
      setModels(modelsData);
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
    return (num || 0).toString();
  };

  // Calculate totals
  const totalSessions = daily.reduce((sum, d) => sum + d.sessions, 0);
  const totalTokens = daily.reduce((sum, d) => sum + d.tokens, 0);
  const totalCost = daily.reduce((sum, d) => sum + d.cost, 0);
  const avgSessions = daily.length ? Math.round(totalSessions / daily.length) : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📈 Analytics Dashboard</h1>
        <p>14-day agent analytics</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Sessions</span>
          <span className="stat-value">{formatNumber(totalSessions)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Tokens</span>
          <span className="stat-value">{formatNumber(totalTokens)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Cost</span>
          <span className="stat-value">${totalCost.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg/Day</span>
          <span className="stat-value">{avgSessions} sess</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Daily Sessions (14 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{fontSize: 11}} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} dot={false} name="Sessions" />
              <Line type="monotone" dataKey="agents" stroke="#22c55e" strokeWidth={2} dot={false} name="Agents" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Cost by Agent (7 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agents.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="agent" stroke="#9ca3af" width={60} tick={{fontSize: 11}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
              />
              <Bar dataKey="cost" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Model Usage</h3>
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
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Agent Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agents.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis type="category" dataKey="agent" stroke="#9ca3af" width={60} tick={{fontSize: 11}} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="avg_tps" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Avg TPS" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
