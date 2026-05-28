# API Contracts

Base path: `/api/v1`

## Health

`GET /health`

```json
{
  "status": "ok",
  "service": "football-value-api"
}
```

## Matches

`GET /matches?league=premier-league&date_from=2026-08-01&date_to=2026-08-08`

Returns pre-match fixtures with latest model probabilities and best available odds.

## Value Bets

`GET /value-bets?min_ev=0.03&league=premier-league&bookmaker=fonbet`

Returns 1X2 value opportunities.

Core formula:

```text
fair_odds = 1 / probability
ev = (probability * bookmaker_odds) - 1
```

## Model Stats

`GET /model-stats?model_version=poisson-elo-v1`

Returns calibration, ROI, CLV, hit rate, drawdown, and league-level performance.

## Backtesting

`POST /backtests`

Starts a walk-forward backtest using historical odds and model versions. Historical odds must be sourced from `odds_history`, never recreated from current odds.
