import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import './Dashboard.css';

const API_BASE = https://mighty-nights-grow.loca.lt/api/quanta;

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#14b8a6', '#f97316'];

function CostsDashboard() {
  const [dailyCosts, setDailyCosts] = useState([]);
  const [agentCosts, setAgentCosts] = useState([]);
  const [modelCosts, setModelCosts] = useState([]);
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
      setDailyCosts(daily);
      setAgentCosts(agents);
      setModelCosts(models);
      
      const totalCost = daily.reduce((sum, d) => sum + (d.cost || 0), 0);
      const avgCost = daily.length ? totalCost / daily.length : 0;
      const maxCost = Math.max(...daily.map(d => d.cost || 0));
      setSummary({ totalCost, avgCost, maxCost, days: daily.length });
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch:', err);
      setLoading(false);
    });
  }, [days]);

  if (loading) {
    return <div className="dashboard"><p className="loading">Loading cost metrics...</p></div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1><span>$</span> Costs</h1>
        <p>
          API cost analytics • Denver timezone (MST)
          <span className="time-range-selector">
            <button className={days === 7 ? 'active' : ''} onClick={() => setDays(7)}>7D</button>
            <button className={days === 14 ? 'active' : ''} onClick={() => setDays(14)}>14D</button>
            <button className={days === 30 ? 'active' : ''} onClick={() => setDays(30)}>30D</button>
          </span>
        </p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Cost</span>
          <span className="stat-value">${(summary?.totalCost || 0).toFixed(2)}</span>
          <span className="stat-change positive">{days} days</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg/Day</span>
          <span className="stat-value">${(summary?.avgCost || 0).toFixed(2)}</span>
          <span className="stat-change positive">per day</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Peak Day</span>
          <span className="stat-value">${(summary?.maxCost || 0).toFixed(2)}</span>
          <span className="stat-change">highest</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Cost/1M Tokens</span>
          <span className="stat-value">$3.00</span>
          <span className="stat-change positive">est.</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Daily Cost Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyCosts}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 11}} tickFormatter={(d) => d.slice(5)} />
              <YAxis stroke="#64748b" tick={{fontSize: 11}} tickFormatter={(v) => `$${v.toFixed(0)}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
              />
              <Area type="monotone" dataKey="cost" stroke="#22c55e" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} name="Cost" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Cost by Agent ({days} days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={agentCosts.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `$${v.toFixed(0)}`} />
              <YAxis type="category" dataKey="agent" stroke="#64748b" width={70} tick={{fontSize: 11}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
              />
              <Bar dataKey="cost" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Cost Distribution by Model</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={modelCosts}
                dataKey="cost"
                nameKey="model"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({model, percent}) => `${model?.slice(0,14) || '?'} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {modelCosts.map((entry, index) => (
                  <Cell key={entry.model} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Agent Cost Efficiency</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={agentCosts.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis type="category" dataKey="agent" stroke="#64748b" width={70} tick={{fontSize: 11}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'JetBrains Mono', fontSize: '12px' }}
                formatter={(value, name) => name === 'cost' ? `$${value.toFixed(2)}` : value}
              />
              <Bar dataKey="cost" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Cost ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default CostsDashboard;
