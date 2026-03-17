import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import './Dashboard.css';

const API_BASE = '/api/quanta';

function GPUDashboard() {
  const [dailyData, setDailyData] = useState([]);
  const [hourly24h, setHourly24h] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/system/gpu/daily?days=${days}`).then(r => r.json()),
      fetch(`${API_BASE}/system/gpu?hours=24`).then(r => r.json()),
      fetch(`${API_BASE}/system/current`).then(r => r.json())
    ]).then(([daily, hourly24, currentData]) => {
      setDailyData(daily);
      setHourly24h(hourly24);
      setCurrent(currentData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch:', err);
      setLoading(false);
    });
  }, [days]);

  if (loading) {
    return <div className="dashboard"><p className="loading">Loading GPU metrics...</p></div>;
  }

  // Calculate 24h stats from hourly data
  const avgUtil24h = hourly24h.length ? (hourly24h.reduce((sum, g) => sum + (g.gpu_util_pct || 0), 0) / hourly24h.length).toFixed(1) : 0;
  const maxUtil24h = hourly24h.length ? Math.max(...hourly24h.map(g => g.gpu_util_pct || 0)).toFixed(1) : 0;
  const avgTemp24h = hourly24h.length ? (hourly24h.reduce((sum, g) => sum + (g.gpu_temp_c || 0), 0) / hourly24h.length).toFixed(0) : 0;
  const avgVRAM24h = hourly24h.length ? (hourly24h.reduce((sum, g) => sum + (g.vram_used_gb || 0), 0) / hourly24h.length).toFixed(1) : 0;

  // Calculate daily stats
  const avgUtilDaily = dailyData.length ? (dailyData.reduce((sum, d) => sum + (d.avg_util || 0), 0) / dailyData.length).toFixed(1) : 0;
  const maxUtilDaily = dailyData.length ? Math.max(...dailyData.map(d => d.max_util || 0)).toFixed(1) : 0;
  const avgTempDaily = dailyData.length ? (dailyData.reduce((sum, d) => sum + (d.avg_temp || 0), 0) / dailyData.length).toFixed(0) : 0;

  // Group 24h data by hour
  const hourlyData = {};
  hourly24h.forEach(g => {
    const hour = g.timestamp?.slice(0, 13) || '';
    if (!hourlyData[hour]) {
      hourlyData[hour] = { hour, utilSum: 0, tempSum: 0, vramSum: 0, count: 0 };
    }
    hourlyData[hour].utilSum += g.gpu_util_pct || 0;
    hourlyData[hour].tempSum += g.gpu_temp_c || 0;
    hourlyData[hour].vramSum += g.vram_used_gb || 0;
    hourlyData[hour].count += 1;
  });

  const hourlyChart = Object.values(hourlyData).map(h => ({
    hour: h.hour.slice(11, 16),
    gpu_util: (h.utilSum / h.count).toFixed(1),
    gpu_temp: Math.round(h.tempSum / h.count),
    vram_used: (h.vramSum / h.count).toFixed(1)
  }));

  // Format daily data for chart
  const dailyChart = dailyData.map(d => ({
    date: d.date.slice(5), // MM-DD
    avg_util: d.avg_util,
    max_util: d.max_util,
    avg_temp: d.avg_temp,
    avg_vram: d.avg_vram,
    snapshots: d.snapshots
  }));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1><span>⚡</span> GPU</h1>
        <p>GPU utilization & resource usage • Denver timezone (MST)</p>
      </header>

      {/* Time range selector */}
      <div className="time-range-selector">
        <button className={days === 7 ? 'active' : ''} onClick={() => setDays(7)}>7D</button>
        <button className={days === 30 ? 'active' : ''} onClick={() => setDays(30)}>30D</button>
        <button className={days === 90 ? 'active' : ''} onClick={() => setDays(90)}>90D</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Current Utilization</span>
          <span className="stat-value">{current?.current?.gpu_util_pct?.toFixed(1) || 0}%</span>
          <span className="stat-change positive">{current?.current?.gpu_name || 'NVIDIA GB10'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg ({days}D)</span>
          <span className="stat-value">{avgUtilDaily}%</span>
          <span className="stat-change positive">Average</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Peak ({days}D)</span>
          <span className="stat-value">{maxUtilDaily}%</span>
          <span className="stat-change">Max</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Temp ({days}D)</span>
          <span className="stat-value">{avgTempDaily}°C</span>
          <span className="stat-change positive">Thermal</span>
        </div>
      </div>

      {/* Historical daily chart - main focus */}
      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Average GPU Usage / Day ({days} days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyChart}>
              <defs>
                <linearGradient id="colorDailyGPU" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [
                  name === 'avg_util' ? `${value}%` : value, 
                  name === 'avg_util' ? 'Avg Util' : 'Max Util'
                ]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="avg_util" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorDailyGPU)" 
                strokeWidth={2}
                name="Avg %"
              />
              <Area 
                type="monotone" 
                dataKey="max_util" 
                stroke="#ef4444" 
                fillOpacity={0.1} 
                fill="#ef4444"
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Peak %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily temperature chart */}
        <div className="chart-card">
          <h3>Average Temperature / Day ({days} days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyChart}>
              <defs>
                <linearGradient id="colorDailyTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tickFormatter={(v) => `${v}°C`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value}°C`, 'Avg Temp']}
              />
              <Area 
                type="monotone" 
                dataKey="avg_temp" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorDailyTemp)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Daily VRAM chart */}
        <div className="chart-card">
          <h3>Average VRAM / Day ({days} days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyChart}>
              <defs>
                <linearGradient id="colorDailyVRAM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tickFormatter={(v) => `${v}GB`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value} GB`, 'Avg VRAM']}
              />
              <Area 
                type="monotone" 
                dataKey="avg_vram" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorDailyVRAM)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Last 24 hours */}
        <div className="chart-card full-width">
          <h3>Last 24 Hours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyChart}>
              <defs>
                <linearGradient id="color24hGPU" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value}%`, 'GPU Util']}
              />
              <Area 
                type="monotone" 
                dataKey="gpu_util" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#color24hGPU)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Current Status */}
        <div className="chart-card full-width">
          <h3>Current Status</h3>
          <div className="server-grid">
            <div className="server-item healthy">
              <span className="server-name">{current?.current?.gpu_name || 'NVIDIA GB10'}</span>
              <span className={`server-status ${(current?.current?.gpu_util_pct || 0) > 80 ? 'warning' : 'healthy'}`}>
                {(current?.current?.gpu_util_pct || 0) > 80 ? 'High' : 'Active'}
              </span>
              <div className="server-stats">
                <span>Util: {current?.current?.gpu_util_pct?.toFixed(1) || 0}%</span>
                <span>VRAM: {current?.current?.vram_used_gb?.toFixed(1) || 0} GB</span>
              </div>
              <span className="server-uptime">Temp: {current?.current?.gpu_temp_c?.toFixed(0) || 0}°C</span>
            </div>
            <div className="server-item healthy">
              <span className="server-name">System Memory</span>
              <span className="server-status healthy">OK</span>
              <div className="server-stats">
                <span>Used: {(current?.current?.mem_used_mb / 1024)?.toFixed(1) || 0} GB</span>
                <span>Total: {(current?.current?.mem_total_mb / 1024)?.toFixed(0) || 0} GB</span>
              </div>
              <span className="server-uptime">{((current?.current?.mem_used_mb / current?.current?.mem_total_mb) * 100)?.toFixed(1) || 0}% used</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GPUDashboard;
