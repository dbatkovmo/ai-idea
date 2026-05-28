from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.repositories.analytics import AnalyticsRepository
from app.schemas.analytics import MatchOut, ModelStatsOut, ValueBetOut
from app.services import mock_repository


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.repository = AnalyticsRepository(db)

    def list_matches(self, league: Optional[str] = None) -> list[MatchOut]:
        matches = self.repository.list_matches(league=league)
        return matches or mock_repository.list_matches()

    def list_value_bets(
        self,
        min_ev: float = 0.03,
        league: Optional[str] = None,
        bookmaker: Optional[str] = None,
    ) -> list[ValueBetOut]:
        value_bets = self.repository.list_value_bets(
            min_ev=min_ev,
            league=league,
            bookmaker=bookmaker,
        )
        return value_bets or mock_repository.list_value_bets(min_ev=min_ev)

    def get_model_stats(self, model_version: Optional[str] = None) -> ModelStatsOut:
        stats = self.repository.get_model_stats(model_version=model_version)
        if stats is not None:
            return stats
        return mock_repository.get_model_stats()
