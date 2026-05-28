# Data Model

## Core Tables

### users

Stores dashboard users and future account metadata.

### leagues

Canonical league records for Premier League, La Liga, Serie A, Bundesliga, and Ligue 1.

### teams

Canonical team records mapped to source provider IDs.

### matches

Fixtures with kickoff time, league, season, home team, away team, status, and result fields.

### match_stats

Historical and pre-match team statistics. Fields must include `as_of` so features can be reconstructed without leakage.

### odds

Latest bookmaker odds per match, market, selection, and bookmaker.

### odds_history

Append-only odds snapshots. This table powers odds movement, opening price, closing price, and CLV.

### predictions

Model probability outputs per match and model version. For MVP, selections are home, draw, and away.

### value_bets

Materialized value signals with probability, bookmaker odds, fair odds, EV, confidence, and recommendation score.

### model_metrics

Calibration, ROI, yield, CLV, drawdown, hit rate, and backtest metrics by model version, league, and date window.

## MVP Enums

- `market`: `1x2`
- `selection`: `home`, `draw`, `away`
- `match_status`: `scheduled`, `live`, `finished`, `postponed`, `cancelled`
- `bookmaker`: `fonbet`, `winline`

## Leakage Rule

Any feature row used for a prediction must have `as_of <= prediction_cutoff`, where `prediction_cutoff < kickoff_at`.
