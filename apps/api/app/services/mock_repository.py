from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Optional

from app.models.domain import Bookmaker, Selection
from app.schemas.analytics import (
    BacktestResultOut,
    MatchOut,
    ModelStatsOut,
    OddsMovementPointOut,
    ProfitCurvePointOut,
    SelectionOut,
    ValueBetOut,
)
from app.services.value_engine import calculate_value_signal

NOW = datetime.now(timezone.utc).replace(microsecond=0)


def list_matches(
    league: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> list[MatchOut]:
    matches = [
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
    if league:
        matches = [match for match in matches if match.league.lower().replace(" ", "-") == league]
    if date_from:
        matches = [match for match in matches if match.kickoff_at.date() >= date_from]
    if date_to:
        matches = [match for match in matches if match.kickoff_at.date() <= date_to]
    return matches


def list_value_bets(
    min_ev: float = 0.03,
    league: Optional[str] = None,
    bookmaker: Optional[Bookmaker] = None,
) -> list[ValueBetOut]:
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
        if league and item["league"].lower().replace(" ", "-") != league:
            continue
        if bookmaker and item["bookmaker"] != bookmaker.value:
            continue
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


def get_odds_movement(
    match_id: str,
    bookmaker: Optional[Bookmaker] = None,
    selection: Optional[Selection] = None,
) -> list[OddsMovementPointOut]:
    del bookmaker, selection
    if match_id not in {"match-001", "match-002"}:
        return []

    if match_id == "match-002":
        opening = 3.72
        fair = 3.2258
        values = [3.72, 3.66, 3.61, 3.58, 3.55]
    else:
        opening = 1.94
        fair = 1.7241
        values = [1.94, 1.91, 1.89, 1.87, 1.86]

    return [
        OddsMovementPointOut(time=time_label, opening=opening, current=current, fair=fair)
        for time_label, current in zip(["Open", "-36h", "-24h", "-12h", "Now"], values)
    ]


def get_backtest_result(
    window: str = "90D",
    league: Optional[str] = None,
    model_version: str = "poisson-elo-v1",
    min_ev: float = 0.03,
) -> BacktestResultOut:
    del min_ev
    league_label = {
        "premier-league": "Premier League",
        "la-liga": "La Liga",
        "serie-a": "Serie A",
        "bundesliga": "Bundesliga",
        "ligue-1": "Ligue 1",
    }.get(league or "", "All leagues")

    return BacktestResultOut(
        id="bt-seed-001",
        model_version=model_version,
        window=window,
        league=league_label,
        roi=0.041,
        clv=0.024,
        max_drawdown=-0.118,
        hit_rate=0.472,
        sample_size=1240,
        losing_streak=7,
        profit_curve=[
            ProfitCurvePointOut(period="W1", bankroll=100.0, drawdown=0.0),
            ProfitCurvePointOut(period="W2", bankroll=101.8, drawdown=-0.012),
            ProfitCurvePointOut(period="W3", bankroll=99.6, drawdown=-0.036),
            ProfitCurvePointOut(period="W4", bankroll=103.2, drawdown=-0.006),
            ProfitCurvePointOut(period="W5", bankroll=105.7, drawdown=0.0),
            ProfitCurvePointOut(period="W6", bankroll=104.1, drawdown=-0.021),
            ProfitCurvePointOut(period="W7", bankroll=107.4, drawdown=0.0),
            ProfitCurvePointOut(period="W8", bankroll=109.2, drawdown=0.0),
            ProfitCurvePointOut(period="W9", bankroll=108.0, drawdown=-0.015),
            ProfitCurvePointOut(period="W10", bankroll=112.1, drawdown=0.0),
        ],
    )
