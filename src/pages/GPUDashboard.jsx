import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Statistic } from 'recharts';
import './Dashboard.css';

const API_BASE = 'http://localhost:3001/api';

function GPUDashboard() {
  const [gpu, setGpu] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/system/gpu?hours=24`).then(r => r.json()),
      fetch(`${API_BASE}/system/current`).then(r => r.json())
    ]).then(([gpuData, currentData]) => {
      setGpu(gpuData);
      setCurrent(currentData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch:', err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="dashboard"><p className="loading">Loading GPU metrics...</p></div>;
  }

  // Calculate averages
  const avgUtil = gpu.length ? (gpu.reduce((sum, g) => sum + (g.gpu_util_pct || 0), 0) / gpu.length).toFixed(1) : 0;
  const avgTemp = gpu.length ? (gpu.reduce((sum, g) => sum + (g.gpu_temp_c || 0), 0) / gpu.length).toFixed(0) : 0;
  const avgVRAM = gpu.length ? (gpu.reduce((sum, g) => sum + (g.vram_used_gb || 0), 0) / gpu.length).toFixed(1) : 0;
  const maxUtil = gpu.length ? Math.max(...gpu.map(g => g.gpu_util_pct || 0)).toFixed(1) : 0;
  const maxVRAM = gpu.length ? Math.max(...gpu.map(g => g.vram_used_gb || 0)).toFixed(1) : 0;

  // Group by hour for chart
  const hourlyData = {};
  gpu.forEach(g => {
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1><span>⚡</span> GPU</h1>
        <p>GPU utilization & resource usage • Last 24 hours • Denver timezone (MST)</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Current Utilization</span>
          <span className="stat-value">{current?.current?.gpu_util_pct?.toFixed(1) || 0}%</span>
          <span className="stat-change positive">{current?.current?.gpu_name || 'GPU'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Utilization (24h)</span>
          <span className="stat-value">{avgUtil}%</span>
          <span className="stat-change positive">Average</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Peak Utilization</span>
          <span className="stat-value">{maxUtil}%</span>
          <span className="stat-change">Max today</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Temperature</span>
          <span className="stat-value">{avgTemp}°C</span>
          <span className="stat-change positive">Thermal</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>GPU Utilization (24h)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={hourlyChart}>
              <defs>
                <linearGradient id="colorGPU" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#colorGPU)" 
                strokeWidth={2}
                name="GPU %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>VRAM Usage (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyChart}>
              <defs>
                <linearGradient id="colorVRAM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tickFormatter={(v) => `${v}GB`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value} GB`, 'VRAM']}
              />
              <Area 
                type="monotone" 
                dataKey="vram_used" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorVRAM)" 
                strokeWidth={2}
                name="VRAM GB"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>GPU Temperature (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyChart}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="hour" stroke="#64748b" tick={{fontSize: 11}} />
              <YAxis stroke="#64748b" tickFormatter={(v) => `${v}°C`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#16161f', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px'
                }}
                formatter={(value) => [`${value}°C`, 'Temp']}
              />
              <Area 
                type="monotone" 
                dataKey="gpu_temp" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorTemp)" 
                strokeWidth={2}
                name="Temp °C"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Current Status</h3>
          <div className="server-grid">
            <div className="server-item healthy">
              <span className="server-name">{current?.current?.gpu_name || 'GPU'}</span>
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
              <span className="server-name">Memory</span>
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
