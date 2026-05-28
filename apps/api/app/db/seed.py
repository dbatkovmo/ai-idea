from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.domain import (
    Bookmaker,
    League,
    Market,
    Match,
    MatchStatus,
    ModelMetrics,
    Odds,
    OddsHistory,
    Prediction,
    Selection,
    Team,
    ValueBet,
)
from app.services.value_engine import calculate_value_signal

MVP_LEAGUES = [
    ("premier-league", "Premier League", "England"),
    ("la-liga", "La Liga", "Spain"),
    ("serie-a", "Serie A", "Italy"),
    ("bundesliga", "Bundesliga", "Germany"),
    ("ligue-1", "Ligue 1", "France"),
]

SEED_MATCHES = [
    ("seed-match-001", "premier-league", "Arsenal", "Newcastle", 0.58, 0.24, 0.18, 1.86, Bookmaker.fonbet),
    ("seed-match-002", "la-liga", "Real Sociedad", "Villarreal", 0.39, 0.31, 0.30, 3.55, Bookmaker.winline),
    ("seed-match-003", "serie-a", "Roma", "Lazio", 0.35, 0.31, 0.34, 3.12, Bookmaker.fonbet),
    ("seed-match-004", "bundesliga", "Leipzig", "Freiburg", 0.62, 0.22, 0.16, 1.72, Bookmaker.winline),
    ("seed-match-005", "ligue-1", "Lille", "Rennes", 0.47, 0.29, 0.24, 2.24, Bookmaker.fonbet),
]


def seed_mvp_data(db: Session) -> None:
    if db.scalar(select(League).limit(1)) is not None:
        return

    now = datetime.now(timezone.utc).replace(microsecond=0)
    leagues: dict[str, League] = {}
    teams: dict[tuple[str, str], Team] = {}

    for slug, name, country in MVP_LEAGUES:
        league = League(slug=slug, name=name, country=country, provider_id=f"seed-{slug}")
        db.add(league)
        leagues[slug] = league

    db.flush()

    for _, league_slug, home_team, away_team, *_ in SEED_MATCHES:
        for team_name in (home_team, away_team):
            key = (league_slug, team_name)
            if key in teams:
                continue
            team = Team(league_id=leagues[league_slug].id, name=team_name, provider_id=f"seed-{team_name}")
            db.add(team)
            teams[key] = team

    db.flush()

    for index, (
        provider_id,
        league_slug,
        home_team,
        away_team,
        home_probability,
        draw_probability,
        away_probability,
        value_odds,
        bookmaker,
    ) in enumerate(SEED_MATCHES, start=1):
        kickoff_at = now + timedelta(days=index, hours=index)
        match = Match(
            provider_id=provider_id,
            league_id=leagues[league_slug].id,
            season="2026-2027",
            kickoff_at=kickoff_at,
            home_team_id=teams[(league_slug, home_team)].id,
            away_team_id=teams[(league_slug, away_team)].id,
            status=MatchStatus.scheduled,
        )
        db.add(match)
        db.flush()

        probabilities = {
            Selection.home: home_probability,
            Selection.draw: draw_probability,
            Selection.away: away_probability,
        }
        market_odds = {
            Selection.home: value_odds if index in (1, 4, 5) else round(1 / home_probability * 0.96, 2),
            Selection.draw: value_odds if index == 2 else round(1 / draw_probability * 0.96, 2),
            Selection.away: value_odds if index == 3 else round(1 / away_probability * 0.96, 2),
        }

        for selection, probability in probabilities.items():
            prediction = Prediction(
                match_id=match.id,
                model_version="poisson-elo-v1",
                selection=selection,
                probability=probability,
                prediction_cutoff=kickoff_at - timedelta(hours=24),
                feature_snapshot={
                    "seed": True,
                    "model_family": "poisson-elo",
                    "leakage_cutoff": (kickoff_at - timedelta(hours=24)).isoformat(),
                },
            )
            db.add(prediction)
            db.flush()

            decimal_odds = market_odds[selection]
            odds = Odds(
                match_id=match.id,
                bookmaker=bookmaker,
                market=Market.one_x_two,
                selection=selection,
                decimal_odds=decimal_odds,
                sampled_at=now,
            )
            db.add(odds)
            db.flush()

            db.add(
                OddsHistory(
                    match_id=match.id,
                    bookmaker=bookmaker,
                    market=Market.one_x_two,
                    selection=selection,
                    decimal_odds=round(decimal_odds * 1.04, 2),
                    sampled_at=now - timedelta(hours=36),
                    source_payload={"seed": True, "phase": "opening"},
                )
            )
            db.add(
                OddsHistory(
                    match_id=match.id,
                    bookmaker=bookmaker,
                    market=Market.one_x_two,
                    selection=selection,
                    decimal_odds=decimal_odds,
                    sampled_at=now,
                    source_payload={"seed": True, "phase": "current"},
                )
            )

            signal = calculate_value_signal(probability, decimal_odds)
            if signal.ev >= 0.03:
                db.add(
                    ValueBet(
                        match_id=match.id,
                        prediction_id=prediction.id,
                        odds_id=odds.id,
                        probability=signal.probability,
                        bookmaker_odds=signal.bookmaker_odds,
                        fair_odds=signal.fair_odds,
                        ev=signal.ev,
                        confidence_score=signal.confidence_score,
                        recommendation_score=signal.recommendation_score,
                    )
                )

    db.add(
        ModelMetrics(
            model_version="poisson-elo-v1",
            league_id=None,
            window_start=now - timedelta(days=90),
            window_end=now,
            roi=0.041,
            yield_rate=0.038,
            clv=0.024,
            hit_rate=0.472,
            max_drawdown=-0.118,
            brier_score=0.041,
            sample_size=1240,
        )
    )
    db.commit()


def main() -> None:
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        seed_mvp_data(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
