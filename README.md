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
uvicorn app.main:app --reload --app-dir apps/api
```

Run database setup inside the API environment:

```bash
cd apps/api
alembic upgrade head
python -m app.db.seed
```

## Product Principle

This platform optimizes disciplined research, EV, odds history, CLV, and backtesting quality. It does not promise guaranteed profit or chase win rate as a standalone metric.
