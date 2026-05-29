from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.collectors.base import CollectorResult
from app.models.domain import League, Match, MatchStatus, Prediction, Selection, Team

DEMO_FIXTURES = [
    {
        "provider_id": "collector-match-001",
        "league": ("premier-league", "Premier League", "England"),
        "home_team": "Chelsea",
        "away_team": "Brighton",
        "hours_from_now": 54,
        "probabilities": {Selection.home: 0.46, Selection.draw: 0.28, Selection.away: 0.26},
    },
    {
        "provider_id": "collector-match-002",
        "league": ("bundesliga", "Bundesliga", "Germany"),
        "home_team": "Dortmund",
        "away_team": "Union Berlin",
        "hours_from_now": 72,
        "probabilities": {Selection.home: 0.61, Selection.draw: 0.23, Selection.away: 0.16},
    },
]


class FixturesCollector:
    name = "fixtures"

    def __init__(self, db: Session) -> None:
        self.db = db

    def collect(self) -> CollectorResult:
        inserted = 0
        updated = 0
        now = datetime.now(timezone.utc).replace(microsecond=0)

        for fixture in DEMO_FIXTURES:
            league_slug, league_name, country = fixture["league"]
            league = self._get_or_create_league(league_slug, league_name, country)
            home_team = self._get_or_create_team(league, fixture["home_team"])
            away_team = self._get_or_create_team(league, fixture["away_team"])
            kickoff_at = now + timedelta(hours=fixture["hours_from_now"])

            match = self.db.scalar(select(Match).where(Match.provider_id == fixture["provider_id"]))
            if match is None:
                match = Match(
                    provider_id=fixture["provider_id"],
                    league_id=league.id,
                    season="2026-2027",
                    kickoff_at=kickoff_at,
                    home_team_id=home_team.id,
                    away_team_id=away_team.id,
                    status=MatchStatus.scheduled,
                )
                self.db.add(match)
                self.db.flush()
                self._ensure_predictions(match, fixture["probabilities"])
                inserted += 1
                continue

            match.kickoff_at = kickoff_at
            match.status = MatchStatus.scheduled
            self._ensure_predictions(match, fixture["probabilities"])
            updated += 1

        self.db.commit()
        return CollectorResult(
            collector=self.name,
            status="ok",
            inserted=inserted,
            updated=updated,
            notes=["Demo fixture collector wrote canonical league, team, and match rows."],
        )

    def _get_or_create_league(self, slug: str, name: str, country: str) -> League:
        league = self.db.scalar(select(League).where(League.slug == slug))
        if league is not None:
            return league

        league = League(slug=slug, name=name, country=country, provider_id=f"collector-{slug}")
        self.db.add(league)
        self.db.flush()
        return league

    def _get_or_create_team(self, league: League, name: str) -> Team:
        team = self.db.scalar(select(Team).where(Team.league_id == league.id, Team.name == name))
        if team is not None:
            return team

        team = Team(league_id=league.id, name=name, provider_id=f"collector-{name}")
        self.db.add(team)
        self.db.flush()
        return team

    def _ensure_predictions(self, match: Match, probabilities: dict[Selection, float]) -> None:
        prediction_cutoff = match.kickoff_at - timedelta(hours=24)
        for selection, probability in probabilities.items():
            prediction = self.db.scalar(
                select(Prediction).where(
                    Prediction.match_id == match.id,
                    Prediction.model_version == "collector-baseline-v1",
                    Prediction.selection == selection,
                )
            )
            if prediction is not None:
                prediction.probability = probability
                prediction.prediction_cutoff = prediction_cutoff
                continue

            self.db.add(
                Prediction(
                    match_id=match.id,
                    model_version="collector-baseline-v1",
                    selection=selection,
                    probability=probability,
                    prediction_cutoff=prediction_cutoff,
                    feature_snapshot={
                        "collector": self.name,
                        "model_family": "baseline",
                        "leakage_cutoff": prediction_cutoff.isoformat(),
                    },
                )
            )
