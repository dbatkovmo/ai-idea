# Architecture

## Product Boundary

The MVP is a pre-match football analytics platform for 1X2 markets across the top five European leagues. The system focuses on model probability, bookmaker odds, EV, fair odds, odds movement, CLV, and backtesting.

## Services

### Web Dashboard

- Next.js app router with TypeScript
- Ant Design components with custom dark quant theme
- SCSS/BEM for product-specific layout and styling
- TanStack Table for dense market tables
- Recharts for analytics charts
- Zustand for local dashboard filters and preferences
- next-intl for UI copy and future localization

### API

- FastAPI application
- Pydantic schemas for request/response contracts
- SQLAlchemy models and repository boundary
- PostgreSQL for canonical historical data
- Redis for cache, locks, and collection state
- APScheduler/Celery-compatible service boundary for collectors

## Data Flow

1. Collect fixture, team, standings, injury, stats, and odds data.
2. Normalize source payloads into canonical match, odds, and stats tables.
3. Store every odds snapshot in `odds_history`.
4. Generate pre-match features using only data available before kickoff.
5. Produce 1X2 probabilities through Poisson, ELO, and ML models.
6. Compare model probability to bookmaker odds.
7. Calculate fair odds, EV, value classification, confidence, and recommendation score.
8. Track closing odds and CLV after market close.
9. Evaluate performance through walk-forward backtests.

## Guardrails

- No future data in features or backtests.
- Odds history is first-class data, not derived after the fact.
- Win rate is secondary to EV, ROI, CLV, calibration, and drawdown.
- Model outputs must be calibrated and auditable.
- Every production collector needs retry, logging, and source freshness metrics.

## Deployment Shape

Docker Compose runs web, API, PostgreSQL, Redis, and Nginx on a VPS. Nginx terminates SSL and routes dashboard and API traffic. Backups target PostgreSQL dumps plus object storage for exported datasets.
