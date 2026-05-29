from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.domain import Bookmaker, Selection
from app.repositories.analytics import AnalyticsRepository
from app.schemas.analytics import BacktestRunIn, BacktestResultOut, MatchOut, ModelStatsOut, OddsMovementPointOut, ValueBetOut
from app.services import mock_repository


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.repository = AnalyticsRepository(db)

    def list_matches(
        self,
        league: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> list[MatchOut]:
        try:
            matches = self.repository.list_matches(league=league, date_from=date_from, date_to=date_to)
        except SQLAlchemyError:
            return mock_repository.list_matches(league=league, date_from=date_from, date_to=date_to)
        return matches or mock_repository.list_matches(league=league, date_from=date_from, date_to=date_to)

    def list_value_bets(
        self,
        min_ev: float = 0.03,
        league: Optional[str] = None,
        bookmaker: Optional[Bookmaker] = None,
    ) -> list[ValueBetOut]:
        try:
            value_bets = self.repository.list_value_bets(
                min_ev=min_ev,
                league=league,
                bookmaker=bookmaker,
            )
        except SQLAlchemyError:
            return mock_repository.list_value_bets(min_ev=min_ev, league=league, bookmaker=bookmaker)
        return value_bets or mock_repository.list_value_bets(min_ev=min_ev, league=league, bookmaker=bookmaker)

    def get_model_stats(self, model_version: Optional[str] = None) -> ModelStatsOut:
        try:
            stats = self.repository.get_model_stats(model_version=model_version)
        except SQLAlchemyError:
            return mock_repository.get_model_stats()
        if stats is not None:
            return stats
        return mock_repository.get_model_stats()

    def get_odds_movement(
        self,
        match_id: str,
        bookmaker: Optional[Bookmaker] = None,
        selection: Optional[Selection] = None,
    ) -> list[OddsMovementPointOut]:
        try:
            movement = self.repository.get_odds_movement(
                match_id=match_id,
                bookmaker=bookmaker,
                selection=selection,
            )
        except SQLAlchemyError:
            return mock_repository.get_odds_movement(
                match_id=match_id,
                bookmaker=bookmaker,
                selection=selection,
            )
        return movement or mock_repository.get_odds_movement(
            match_id=match_id,
            bookmaker=bookmaker,
            selection=selection,
        )

    def run_backtest(self, payload: BacktestRunIn) -> BacktestResultOut:
        return mock_repository.get_backtest_result(
            window=payload.window,
            league=payload.league,
            model_version=payload.model_version,
            min_ev=payload.min_ev,
        )

    def get_latest_backtest(self) -> BacktestResultOut:
        return mock_repository.get_backtest_result()
