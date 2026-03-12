import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './Dashboard.css';

function SystemDashboard() {
  const [cpuData, setCpuData] = useState([]);
  const [memoryData, setMemoryData] = useState([]);
  const [disks, setDisks] = useState([
    { name: '/', used: 45, total: 100 },
    { name: '/var', used: 72, total: 100 },
    { name: '/tmp', used: 23, total: 100 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setCpuData(prev => [...prev.slice(-30), { time, value: Math.random() * 100 }]);
      setMemoryData(prev => [...prev.slice(-30), { time, value: Math.random() * 100 }]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const servers = [
    { name: 'server-01', status: 'healthy', cpu: 45, memory: 62, uptime: '45d 12h' },
    { name: 'server-02', status: 'healthy', cpu: 38, memory: 55, uptime: '45d 12h' },
    { name: 'server-03', status: 'warning', cpu: 78, memory: 81, uptime: '12d 3h' },
    { name: 'database-01', status: 'healthy', cpu: 22, memory: 48, uptime: '45d 12h' },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🖥️ System Dashboard</h1>
        <p>Infrastructure monitoring</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">CPU Usage</span>
          <span className="stat-value">47%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Memory</span>
          <span className="stat-value">61%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Disk I/O</span>
          <span className="stat-value">128 MB/s</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Network</span>
          <span className="stat-value">45 Mbps</span>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>CPU Usage Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={cpuData.length ? cpuData : [{ time: '00:00', value: 45 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#f59e0b33" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Memory Usage Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={memoryData.length ? memoryData : [{ time: '00:00', value: 55 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf633" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Disk Usage</h3>
          <div className="disk-grid">
            {disks.map(disk => (
              <div key={disk.name} className="disk-item">
                <span className="disk-name">{disk.name}</span>
                <div className="disk-bar">
                  <div className="disk-used" style={{ width: `${disk.used}%` }}></div>
                </div>
                <span className="disk-percent">{disk.used}% used</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card full-width">
          <h3>Server Status</h3>
          <div className="server-grid">
            {servers.map(server => (
              <div key={server.name} className={`server-item ${server.status}`}>
                <span className="server-name">{server.name}</span>
                <span className={`server-status ${server.status}`}>{server.status}</span>
                <div className="server-stats">
                  <span>CPU: {server.cpu}%</span>
                  <span>Mem: {server.memory}%</span>
                </div>
                <span className="server-uptime">{server.uptime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemDashboard;
