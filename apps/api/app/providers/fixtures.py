from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from app.models.domain import MatchStatus, Selection


@dataclass(frozen=True)
class ProviderLeague:
    provider_id: str
    slug: str
    name: str
    country: str


@dataclass(frozen=True)
class ProviderTeam:
    provider_id: str
    name: str


@dataclass(frozen=True)
class ProviderFixture:
    provider_id: str
    league: ProviderLeague
    home_team: ProviderTeam
    away_team: ProviderTeam
    season: str
    kickoff_at: datetime
    status: MatchStatus
    home_score: int | None
    away_score: int | None
    probabilities: dict[Selection, float] | None = None


class FixtureProvider(Protocol):
    name: str

    def fetch_fixtures(self) -> list[ProviderFixture]:
        """Return normalized fixtures ready for persistence."""
