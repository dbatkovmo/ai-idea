from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.schemas.analytics import MatchOut, ModelStatsOut, SelectionOut, ValueBetOut
from app.services.value_engine import calculate_value_signal

NOW = datetime.now(timezone.utc).replace(microsecond=0)


def list_matches() -> list[MatchOut]:
    return [
        MatchOut(
            id="match-001",
            league="Premier League",
            kickoff_at=NOW + timedelta(days=2, hours=3),
            home_team="Arsenal",
            away_team="Newcastle",
            status="scheduled",
            home_probability=0.58,
            draw_probability=0.24,
            away_probability=0.18,
        ),
        MatchOut(
            id="match-002",
            league="La Liga",
            kickoff_at=NOW + timedelta(days=2, hours=6),
            home_team="Real Sociedad",
            away_team="Villarreal",
            status="scheduled",
            home_probability=0.39,
            draw_probability=0.31,
            away_probability=0.30,
        ),
    ]


def list_value_bets(min_ev: float = 0.03) -> list[ValueBetOut]:
    raw = [
        {
            "id": "vb-001",
            "match_id": "match-001",
            "league": "Premier League",
            "kickoff_at": NOW + timedelta(days=2, hours=3),
            "home_team": "Arsenal",
            "away_team": "Newcastle",
            "selection": SelectionOut.home,
            "bookmaker": "fonbet",
            "probability": 0.58,
            "bookmaker_odds": 1.86,
        },
        {
            "id": "vb-002",
            "match_id": "match-002",
            "league": "La Liga",
            "kickoff_at": NOW + timedelta(days=2, hours=6),
            "home_team": "Real Sociedad",
            "away_team": "Villarreal",
            "selection": SelectionOut.draw,
            "bookmaker": "winline",
            "probability": 0.31,
            "bookmaker_odds": 3.55,
        },
    ]

    value_bets: list[ValueBetOut] = []
    for item in raw:
        signal = calculate_value_signal(item["probability"], item["bookmaker_odds"])
        if signal.ev < min_ev:
            continue
        value_bets.append(
            ValueBetOut(
                **item,
                fair_odds=round(signal.fair_odds, 4),
                ev=round(signal.ev, 4),
                confidence_score=round(signal.confidence_score, 4),
                recommendation_score=round(signal.recommendation_score, 2),
            )
        )
    return value_bets


def get_model_stats() -> ModelStatsOut:
    return ModelStatsOut(
        model_version="poisson-elo-v1",
        roi=0.041,
        yield_rate=0.038,
        clv=0.024,
        hit_rate=0.472,
        max_drawdown=-0.118,
        brier_score=0.041,
        sample_size=1240,
    )
