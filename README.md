# AI Football Value Betting Platform

Enterprise AI analytics dashboard for football value bets.

## Current Stage

- [x] Planning
- [x] Architecture
- [x] Frontend Foundation
- [x] Backend Foundation
- [ ] Data Collection
- [ ] Prediction Engine
- [ ] Value Engine
- [ ] Backtesting
- [ ] Dashboard UI
- [ ] Deployment
- [ ] MVP Release

## MVP Scope

- Leagues: Premier League, La Liga, Serie A, Bundesliga, Ligue 1
- Markets: 1X2 only
- Mode: pre-match only
- Product: web dashboard

## Monorepo

```text
apps/
  api/       FastAPI analytics and data API
  web/       Next.js dashboard
docs/        Architecture, contracts, and data model notes
infra/       Nginx and deployment configuration
```

## Local Development

Copy environment variables:

```bash
cp .env.example .env
```

Run the full stack with Docker:

```bash
docker compose up --build
```

Run services individually:

```bash
pnpm --dir apps/web dev
apps/api/.venv/Scripts/python.exe -m uvicorn app.main:app --reload --app-dir apps/api
```

On Windows through the root package scripts:

```powershell
cmd /c pnpm dev:web
cmd /c pnpm dev:api
```

If the API is run outside Docker, point it at a local database host:

```powershell
$env:POSTGRES_HOST="localhost"
cmd /c pnpm dev:api
```

Run database setup inside the API environment:

```bash
cd apps/api
.venv/Scripts/python.exe -m alembic upgrade head
.venv/Scripts/python.exe -m app.db.seed
```

## Local URLs

- Web dashboard: `http://localhost:3000/ru`
- API health: `http://localhost:8000/api/v1/health`
- API readiness with database check: `http://localhost:8000/api/v1/ready`
- Nginx gateway when Docker Compose is running: `http://localhost:8080/ru`

`/health` only confirms that the FastAPI process is alive. `/ready` checks database connectivity and returns `503` until PostgreSQL is available.

## Implemented MVP API

- `GET /api/v1/health`
- `GET /api/v1/ready`
- `GET /api/v1/matches?league=la-liga&date_from=2026-01-01&date_to=2026-12-31`
- `GET /api/v1/value-bets?min_ev=0.05&league=premier-league&bookmaker=fonbet`
- `GET /api/v1/matches/{match_id}/odds-movement?bookmaker=fonbet&selection=home`
- `GET /api/v1/backtests/latest`
- `POST /api/v1/backtests`

Example backtest request:

```json
{
  "window": "90D",
  "league": "premier-league",
  "model_version": "poisson-elo-v1",
  "min_ev": 0.03
}
```

When PostgreSQL is unavailable, read endpoints fall back to filtered mock data so the dashboard can still run in local UI mode. Docker Compose is the intended full-stack mode for database-backed data.

## Product Principle

This platform optimizes disciplined research, EV, odds history, CLV, and backtesting quality. It does not promise guaranteed profit or chase win rate as a standalone metric.
