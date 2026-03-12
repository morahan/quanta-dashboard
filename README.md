# Quanta Dashboard

Real-time metrics dashboard for the Quanta multi-agent system.

## Features

- **Main Dashboard** — Today's session counts, tokens, costs, and activity timeseries
- **Analytics** — 14-day agent performance, model usage, cost breakdown
- **System** — GPU utilization, VRAM, CPU/memory from sys_snapshots
- **Alerts** — Anomaly detection alerts from anomalies_log

## Quick Start

```bash
# Install dependencies
npm install

# Run both API and dev server
npm run dev:all

# Or run separately:
npm run server   # API on port 3001
npm run dev      # Frontend on port 5173
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/main/summary` | Today's metrics summary |
| `GET /api/main/timeseries` | Hourly breakdown for today |
| `GET /api/analytics/daily` | 14-day daily stats |
| `GET /api/analytics/agents` | Agent breakdown (7 days) |
| `GET /api/analytics/models` | Model usage (7 days) |
| `GET /api/system/current` | Current system stats + hourly |
| `GET /api/system/gpu` | 24h GPU metrics |
| `GET /api/alerts/recent` | Recent anomalies |
| `GET /api/alerts/summary` | Alert counts by severity |

## Data Source

Queries `analytics.db` on the DGX Spark at:
```
/home/scribble0563/clawd/dashboard/data/analytics.db
```

## Tech Stack

- React 19 + Vite
- Recharts for visualization
- Express + better-sqlite3 for API
