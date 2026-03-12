import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to analytics DB
const db = new Database('/home/scribble0563/clawd/dashboard/data/analytics.db', {
  readonly: true
});

app.use(cors());
app.use(express.json());

// Helper to format dates
const formatDate = (d) => d ? d.split(' ')[0] : null;

// ============ MAIN DASHBOARD APIs ============

// GET /api/main/summary - Today's metrics
app.get('/api/main/summary', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Get today's data
    const todayData = db.prepare(`
      SELECT 
        COUNT(*) as sessions,
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(cost_usd), 0) as cost,
        COUNT(DISTINCT agent) as agents
      FROM session_metrics 
      WHERE date = ?
    `).get(today);
    
    // Get yesterday's for comparison
    const yesterdayData = db.prepare(`
      SELECT 
        COUNT(*) as sessions,
        COALESCE(SUM(cost_usd), 0) as cost
      FROM session_metrics 
      WHERE date = ?
    `).get(yesterday);
    
    // Calculate changes
    const sessionChange = yesterdayData.sessions ? 
      ((todayData.sessions - yesterdayData.sessions) / yesterdayData.sessions * 100).toFixed(1) : 0;
    const costChange = yesterdayData.cost ? 
      ((todayData.cost - yesterdayData.cost) / yesterdayData.cost * 100).toFixed(1) : 0;
    
    res.json({
      sessions: todayData.sessions || 0,
      tokens: todayData.tokens || 0,
      cost: todayData.cost || 0,
      agents: todayData.agents || 0,
      sessionChange: parseFloat(sessionChange),
      costChange: parseFloat(costChange),
      date: today
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/main/timeseries - Hourly data for today
app.get('/api/main/timeseries', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const data = db.prepare(`
      SELECT 
        date || ' ' || substr(session_start, 12, 2) || ':00' as time,
        COUNT(*) as sessions,
        COALESCE(SUM(cost_usd), 0) as cost,
        COALESCE(SUM(total_tokens), 0) as tokens
      FROM session_metrics 
      WHERE date = ?
      GROUP BY date, substr(session_start, 12, 2)
      ORDER BY time
    `).all(today);
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ANALYTICS DASHBOARD APIs ============

// GET /api/analytics/daily - Daily stats for last 14 days
app.get('/api/analytics/daily', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        date,
        COUNT(*) as sessions,
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(cost_usd), 0) as cost,
        COUNT(DISTINCT agent) as agents
      FROM session_metrics
      WHERE date >= date('now', '-14 days')
      GROUP BY date
      ORDER BY date
    `).all();
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/agents - Agent breakdown
app.get('/api/analytics/agents', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        agent,
        COUNT(*) as sessions,
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(cost_usd), 0) as cost,
        ROUND(AVG(duration_s), 1) as avg_duration,
        ROUND(AVG(tps_inferred), 1) as avg_tps
      FROM session_metrics
      WHERE date >= date('now', '-7 days')
      GROUP BY agent
      ORDER BY cost DESC
    `).all();
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/models - Model usage
app.get('/api/analytics/models', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        COALESCE(model, 'unknown') as model,
        COUNT(*) as sessions,
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(cost_usd), 0) as cost
      FROM session_metrics
      WHERE date >= date('now', '-7 days')
      GROUP BY model
      ORDER BY cost DESC
    `).all();
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ SYSTEM DASHBOARD APIs ============

// GET /api/system/current - Current system stats
app.get('/api/system/current', (req, res) => {
  try {
    // Get latest snapshot
    const snapshot = db.prepare(`
      SELECT * FROM sys_snapshots 
      ORDER BY timestamp DESC 
      LIMIT 1
    `).get();
    
    // Get hourly averages for last 24 hours
    const hourly = db.prepare(`
      SELECT 
        substr(timestamp, 1, 13) as hour,
        ROUND(AVG(gpu_util_pct), 1) as gpu_util,
        ROUND(AVG(vram_used_gb), 1) as vram_used,
        ROUND(AVG(cpu_load_1m), 1) as cpu_load,
        ROUND(AVG(mem_used_mb * 100.0 / NULLIF(mem_total_mb, 0)), 1) as mem_pct
      FROM sys_snapshots
      WHERE timestamp >= datetime('now', '-24 hours')
      GROUP BY substr(timestamp, 1, 13)
      ORDER BY hour
    `).all();
    
    // Get VRAM trend
    const vramTrend = db.prepare(`
      SELECT 
        timestamp,
        vram_used_gb,
        gpu_util_pct
      FROM sys_snapshots
      WHERE timestamp >= datetime('now', '-1 hour')
      ORDER BY timestamp
    `).all();
    
    res.json({
      current: snapshot || null,
      hourly: hourly,
      vramTrend: vramTrend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/system/gpu - GPU metrics
app.get('/api/system/gpu', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT 
        timestamp,
        gpu_name,
        gpu_util_pct,
        gpu_temp_c,
        vram_used_gb,
        cpu_load_1m,
        mem_used_mb,
        mem_total_mb
      FROM sys_snapshots
      WHERE timestamp >= datetime('now', '-24 hours')
      ORDER BY timestamp
    `).all();
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ALERTS DASHBOARD APIs ============

// GET /api/alerts/recent - Recent anomalies/alerts
app.get('/api/alerts/recent', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT * FROM anomalies_log
      ORDER BY timestamp DESC
      LIMIT 50
    `).all();
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/alerts/summary - Alert counts by severity
app.get('/api/alerts/summary', (req, res) => {
  try {
    const total = db.prepare(`SELECT COUNT(*) as count FROM anomalies_log`).get();
    const critical = db.prepare(`SELECT COUNT(*) as count FROM anomalies_log WHERE severity = 'critical'`).get();
    const high = db.prepare(`SELECT COUNT(*) as count FROM anomalies_log WHERE severity = 'high'`).get();
    const medium = db.prepare(`SELECT COUNT(*) as count FROM anomalies_log WHERE severity = 'medium'`).get();
    const low = db.prepare(`SELECT COUNT(*) as count FROM anomalies_log WHERE severity = 'low'`).get();
    
    res.json({
      total: total.count,
      critical: critical.count,
      high: high.count,
      medium: medium.count,
      low: low.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Quanta API server running on port ${PORT}`);
});
