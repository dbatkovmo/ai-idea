from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.collectors.base import CollectorResult
from app.core.config import Settings, get_settings
from app.models.domain import League, Match, MatchStatus, Prediction, Selection, Team
from app.providers.fixtures import FixtureProvider, ProviderFixture, ProviderLeague, ProviderTeam
from app.providers.football_data import FootballDataFixturesProvider


@dataclass(frozen=True)
class DemoFixtureSpec:
    provider_id: str
    league: ProviderLeague
    home_team: ProviderTeam
    away_team: ProviderTeam
    hours_from_now: int
    probabilities: dict[Selection, float]


DEMO_FIXTURES = [
    DemoFixtureSpec(
        provider_id="collector-match-001",
        league=ProviderLeague("collector-premier-league", "premier-league", "Premier League", "England"),
        home_team=ProviderTeam("collector-chelsea", "Chelsea"),
        away_team=ProviderTeam("collector-brighton", "Brighton"),
        hours_from_now=54,
        probabilities={Selection.home: 0.46, Selection.draw: 0.28, Selection.away: 0.26},
    ),
    DemoFixtureSpec(
        provider_id="collector-match-002",
        league=ProviderLeague("collector-bundesliga", "bundesliga", "Bundesliga", "Germany"),
        home_team=ProviderTeam("collector-dortmund", "Dortmund"),
        away_team=ProviderTeam("collector-union-berlin", "Union Berlin"),
        hours_from_now=72,
        probabilities={Selection.home: 0.61, Selection.draw: 0.23, Selection.away: 0.16},
    ),
]

DEFAULT_BASELINE_PROBABILITIES = {Selection.home: 0.45, Selection.draw: 0.28, Selection.away: 0.27}


class FixturesCollector:
    name = "fixtures"

    def __init__(
        self,
        db: Session,
        provider: FixtureProvider | None = None,
        settings: Settings | None = None,
    ) -> None:
        self.db = db
        self.settings = settings or get_settings()
        self.provider = provider or self._select_provider()

    def collect(self) -> CollectorResult:
        inserted = 0
        updated = 0
        fixtures = self.provider.fetch_fixtures()

        for fixture in fixtures:
            league = self._get_or_create_league(fixture.league)
            home_team = self._get_or_create_team(league, fixture.home_team)
            away_team = self._get_or_create_team(league, fixture.away_team)
            match = self.db.scalar(select(Match).where(Match.provider_id == fixture.provider_id))

            if match is None:
                match = Match(
                    provider_id=fixture.provider_id,
                    league_id=league.id,
                    season=fixture.season,
                    kickoff_at=fixture.kickoff_at,
                    home_team_id=home_team.id,
                    away_team_id=away_team.id,
                    status=fixture.status,
                    home_score=fixture.home_score,
                    away_score=fixture.away_score,
                )
                self.db.add(match)
                self.db.flush()
                self._ensure_predictions(match, fixture.probabilities or DEFAULT_BASELINE_PROBABILITIES)
                inserted += 1
                continue

            match.league_id = league.id
            match.kickoff_at = fixture.kickoff_at
            match.status = fixture.status
            match.home_score = fixture.home_score
            match.away_score = fixture.away_score
            self._ensure_predictions(match, fixture.probabilities or DEFAULT_BASELINE_PROBABILITIES)
            updated += 1

        self.db.commit()
        return CollectorResult(
            collector=self.name,
            status="ok",
            inserted=inserted,
            updated=updated,
            notes=[f"{self.provider.name} fixture collector wrote canonical league, team, and match rows."],
        )

    def _select_provider(self) -> FixtureProvider:
        if self.settings.data_provider_mode == "real":
            return FootballDataFixturesProvider(self.settings)
        return DemoFixturesProvider()

    def _get_or_create_league(self, provider_league: ProviderLeague) -> League:
        league = self.db.scalar(select(League).where(League.slug == provider_league.slug))
        if league is not None:
            league.name = provider_league.name
            league.country = provider_league.country
            league.provider_id = provider_league.provider_id
            return league

        league = League(
            slug=provider_league.slug,
            name=provider_league.name,
            country=provider_league.country,
            provider_id=provider_league.provider_id,
        )
        self.db.add(league)
        self.db.flush()
        return league

    def _get_or_create_team(self, league: League, provider_team: ProviderTeam) -> Team:
        team = self.db.scalar(select(Team).where(Team.league_id == league.id, Team.name == provider_team.name))
        if team is not None:
            team.provider_id = provider_team.provider_id
            return team

        team = Team(league_id=league.id, name=provider_team.name, provider_id=provider_team.provider_id)
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


class DemoFixturesProvider:
    name = "demo"

    def fetch_fixtures(self) -> list[ProviderFixture]:
        now = datetime.now(timezone.utc).replace(microsecond=0)
        return [
            ProviderFixture(
                provider_id=fixture.provider_id,
                league=fixture.league,
                home_team=fixture.home_team,
                away_team=fixture.away_team,
                season="2026-2027",
                kickoff_at=now + timedelta(hours=fixture.hours_from_now),
                status=MatchStatus.scheduled,
                home_score=None,
                away_score=None,
                probabilities=fixture.probabilities,
            )
            for fixture in DEMO_FIXTURES
        ]
