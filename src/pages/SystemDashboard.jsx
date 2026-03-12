import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const API_BASE = 'http://localhost:3001/api';

function SystemDashboard() {
  const [system, setSystem] = useState(null);
  const [gpu, setGpu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [systemRes, gpuRes] = await Promise.all([
          fetch(`${API_BASE}/system/current`).then(r => r.json()),
          fetch(`${API_BASE}/system/gpu`).then(r => r.json())
        ]);
        setSystem(systemRes);
        setGpu(gpuRes);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !system?.current) {
    return <div className="dashboard"><p>Loading system metrics...</p></div>;
  }

  const { current, hourly, vramTrend } = system;
  const memPct = current.mem_total_mb ? (current.mem_used_mb / current.mem_total_mb * 100).toFixed(1) : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🖥️ System Dashboard</h1>
        <p>Infrastructure monitoring • {current.timestamp?.slice(0, 16) || 'Live'}</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">GPU Usage</span>
          <span className="stat-value">{current.gpu_util_pct?.toFixed(1) || 0}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">VRAM Used</span>
          <span className="stat-value">{current.vram_used_gb?.toFixed(1) || 0} GB</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Memory</span>
          <span className="stat-value">{memPct}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">CPU Load</span>
          <span className="stat-value">{current.cpu_load_1m?.toFixed(1) || 0}</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>GPU Utilization (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" tick={{fontSize: 10}} tickFormatter={(h) => h.slice(-5)} />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="gpu_util" stroke="#f59e0b" fill="#f59e0b33" strokeWidth={2} name="GPU %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>VRAM Usage (24h)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9ca3af" tick={{fontSize: 10}} tickFormatter={(h) => h.slice(-5)} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="vram_used" stroke="#8b5cf6" fill="#8b5cf633" strokeWidth={2} name="VRAM GB" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Real-time VRAM (Last Hour)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={vramTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9ca3af" tick={{fontSize: 10}} tickFormatter={(t) => t.slice(11, 16)} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="vram_used_gb" stroke="#22c55e" fill="#22c55e33" strokeWidth={2} name="VRAM GB" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Current System Status</h3>
          <div className="server-grid">
            <div className="server-item healthy">
              <span className="server-name">{current.gpu_name || 'GPU'}</span>
              <span className="server-status healthy">online</span>
              <div className="server-stats">
                <span>GPU: {current.gpu_util_pct?.toFixed(0) || 0}%</span>
                <span>VRAM: {current.vram_used_gb?.toFixed(1) || 0}GB</span>
              </div>
              <span className="server-uptime">Temp: {current.gpu_temp_c?.toFixed(0) || 0}°C</span>
            </div>
            <div className="server-item healthy">
              <span className="server-name">CPU</span>
              <span className="server-status healthy">online</span>
              <div className="server-stats">
                <span>Load: {current.cpu_load_1m?.toFixed(1) || 0}</span>
                <span>Cores: {current.cpu_cores || 0}</span>
              </div>
              <span className="server-uptime">RAM: {memPct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemDashboard;
