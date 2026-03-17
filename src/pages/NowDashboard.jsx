import { useState, useEffect } from 'react';
import './Dashboard.css';

const API_BASE = https://mighty-nights-grow.loca.lt/api/quanta;

// Agent config - in production this would come from the API
const AGENT_CONFIG = {
  main: { name: 'Marty', emoji: '🎯', color: '#3b82f6' },
  aria: { name: 'Aria', emoji: '🎨', color: '#8b5cf6' },
  greta: { name: 'Greta', emoji: '📅', color: '#ec4899' },
  reno: { name: 'Reno', emoji: '📈', color: '#22c55e' },
  freq: { name: 'Freq', emoji: '📡', color: '#06b6d4' },
  kaia: { name: 'Kaia', emoji: '💫', color: '#f59e0b' },
  thea: { name: 'Thea', emoji: '🔍', color: '#a855f7' },
  badger: { name: 'Badger', emoji: '🏃', color: '#ef4444' },
  renzo: { name: 'Renzo', emoji: '🛡️', color: '#14b8a6' },
  maverick: { name: 'Maverick', emoji: '🤠', color: '#f97316' },
  quanta: { name: 'Quanta', emoji: '⏱️', color: '#00d4ff' },
  rocio: { name: 'Rocio', emoji: '🌟', color: '#84cc16' },
  workoutflow: { name: 'Buddy', emoji: '💪', color: '#22c55e' },
  'buddy-beta': { name: 'BuddyFlowBot', emoji: '🤖', color: '#6366f1' }
};

function NowDashboard() {
  const [system, setSystem] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch system data
        const sysRes = await fetch(`${API_BASE}/system/current`);
        const sysData = await sysRes.json();
        setSystem(sysData);
        
        // Fetch active sessions via Gateway API (simulated for now)
        // In production, this would call sessions_list endpoint
        const sessionsRes = await fetch('/api/now');
        const sessionsData = await sessionsRes.json();
        
        // Get active agents from sessions (simulated response)
        // For now, we'll use a mock that shows available agents
        const agentList = Object.keys(AGENT_CONFIG).map(id => {
          const config = AGENT_CONFIG[id];
          // Check if agent was recently active (in last 60 min)
          const isActive = Math.random() > 0.5; // Placeholder - real implementation would check sessions
          return {
            id,
            name: config.name,
            emoji: config.emoji,
            color: config.color,
            state: isActive ? 'active' : 'idle',
            model: 'MiniMax M2.5',
            lastActive: isActive ? new Date().toISOString() : null
          };
        });
        
        setAgents(agentList);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="dashboard"><p className="loading">Loading current state...</p></div>;
  }

  const memPct = system?.current?.mem_total_mb 
    ? (system.current.mem_used_mb / system.current.mem_total_mb * 100).toFixed(1) 
    : 0;

  const activeAgents = agents.filter(a => a.state === 'active');
  const idleAgents = agents.filter(a => a.state === 'idle');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1><span>◉</span> Now</h1>
        <p>Current system state • Live</p>
      </header>

      {/* System Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">GPU Utilization</span>
          <span className="stat-value">{system?.current?.gpu_util_pct?.toFixed(1) || 0}%</span>
          <span className="stat-change positive">{system?.current?.gpu_name || 'GPU'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">GPU Temp</span>
          <span className="stat-value">{system?.current?.gpu_temp_c?.toFixed(0) || 0}°C</span>
          <span className="stat-change">Thermal</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">VRAM Used</span>
          <span className="stat-value">{system?.current?.vram_used_gb?.toFixed(1) || 0} GB</span>
          <span className="stat-change">Memory</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">CPU Load</span>
          <span className="stat-value">{system?.current?.cpu_load_1m?.toFixed(2) || 0}</span>
          <span className="stat-change">Cores: {system?.current?.cpu_cores || 0}</span>
        </div>
      </div>

      {/* Active Agents */}
      <div className="charts-grid">
        <div className="chart-card full-width">
          <h3>Active Agents ({activeAgents.length})</h3>
          {activeAgents.length > 0 ? (
            <div className="agents-grid">
              {activeAgents.map(agent => (
                <div key={agent.id} className="agent-card active" style={{ borderLeftColor: agent.color }}>
                  <div className="agent-header">
                    <span className="agent-emoji">{agent.emoji}</span>
                    <span className="agent-name">{agent.name}</span>
                    <span className="agent-state active-badge">Active</span>
                  </div>
                  <div className="agent-details">
                    <span className="agent-model">🤖 {agent.model}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No active agents</p>
          )}
        </div>

        {/* Idle Agents */}
        <div className="chart-card full-width">
          <h3>Available Agents ({idleAgents.length})</h3>
          <div className="agents-grid">
            {idleAgents.map(agent => (
              <div key={agent.id} className="agent-card idle" style={{ borderLeftColor: agent.color }}>
                <div className="agent-header">
                  <span className="agent-emoji">{agent.emoji}</span>
                  <span className="agent-name">{agent.name}</span>
                  <span className="agent-state idle-badge">Idle</span>
                </div>
                <div className="agent-details">
                  <span className="agent-model">🤖 {agent.model}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Details */}
        <div className="chart-card full-width">
          <h3>System Details</h3>
          <div className="server-grid">
            <div className="server-item healthy">
              <span className="server-name">{system?.current?.gpu_name || 'GPU'}</span>
              <span className="server-status healthy">Online</span>
              <div className="server-stats">
                <span>Util: {system?.current?.gpu_util_pct?.toFixed(1) || 0}%</span>
                <span>VRAM: {system?.current?.vram_used_gb?.toFixed(1) || 0} GB</span>
              </div>
              <span className="server-uptime">Temp: {system?.current?.gpu_temp_c?.toFixed(0) || 0}°C</span>
            </div>
            <div className="server-item healthy">
              <span className="server-name">System Memory</span>
              <span className="server-status healthy">OK</span>
              <div className="server-stats">
                <span>Used: {((system?.current?.mem_used_mb || 0) / 1024).toFixed(1)} GB</span>
                <span>Total: {((system?.current?.mem_total_mb || 0) / 1024).toFixed(0)} GB</span>
              </div>
              <span className="server-uptime">{memPct}% used</span>
            </div>
            <div className="server-item healthy">
              <span className="server-name">DGX Spark</span>
              <span className="server-status healthy">Online</span>
              <div className="server-stats">
                <span>CPU: {system?.current?.cpu_cores || 0} cores</span>
                <span>Load: {system?.current?.cpu_load_1m?.toFixed(2) || 0}</span>
              </div>
              <span className="server-uptime">Last update: {system?.current?.timestamp?.slice(11, 19) || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NowDashboard;
