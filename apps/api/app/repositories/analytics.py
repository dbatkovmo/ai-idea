from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, aliased

from app.models.domain import Bookmaker, League, Match, ModelMetrics, Odds, Prediction, Selection, Team, ValueBet
from app.schemas.analytics import MatchOut, ModelStatsOut, SelectionOut, ValueBetOut


class AnalyticsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_matches(self, league: Optional[str] = None) -> list[MatchOut]:
        home_team = aliased(Team)
        away_team = aliased(Team)
        home_prediction = aliased(Prediction)
        draw_prediction = aliased(Prediction)
        away_prediction = aliased(Prediction)

        stmt = (
            select(Match, League, home_team, away_team, home_prediction, draw_prediction, away_prediction)
            .join(League, Match.league_id == League.id)
            .join(home_team, Match.home_team_id == home_team.id)
            .join(away_team, Match.away_team_id == away_team.id)
            .join(
                home_prediction,
                (home_prediction.match_id == Match.id) & (home_prediction.selection == Selection.home),
            )
            .join(
                draw_prediction,
                (draw_prediction.match_id == Match.id) & (draw_prediction.selection == Selection.draw),
            )
            .join(
                away_prediction,
                (away_prediction.match_id == Match.id) & (away_prediction.selection == Selection.away),
            )
            .order_by(Match.kickoff_at.asc())
        )
        if league:
            stmt = stmt.where(League.slug == league)

        return [
            MatchOut(
                id=str(match.id),
                league=league_row.name,
                kickoff_at=match.kickoff_at,
                home_team=home.name,
                away_team=away.name,
                status=match.status.value,
                home_probability=home_pred.probability,
                draw_probability=draw_pred.probability,
                away_probability=away_pred.probability,
            )
            for match, league_row, home, away, home_pred, draw_pred, away_pred in self.db.execute(stmt).all()
        ]

    def list_value_bets(
        self,
        min_ev: float = 0.03,
        league: Optional[str] = None,
        bookmaker: Optional[str] = None,
    ) -> list[ValueBetOut]:
        home_team = aliased(Team)
        away_team = aliased(Team)
        stmt = (
            select(ValueBet, Match, League, home_team, away_team, Prediction, Odds)
            .join(Match, ValueBet.match_id == Match.id)
            .join(League, Match.league_id == League.id)
            .join(home_team, Match.home_team_id == home_team.id)
            .join(away_team, Match.away_team_id == away_team.id)
            .join(Prediction, ValueBet.prediction_id == Prediction.id)
            .join(Odds, ValueBet.odds_id == Odds.id)
            .where(ValueBet.ev >= min_ev)
            .order_by(ValueBet.ev.desc())
        )
        if league:
            stmt = stmt.where(League.slug == league)
        if bookmaker:
            stmt = stmt.where(Odds.bookmaker == Bookmaker(bookmaker))

        return [
            ValueBetOut(
                id=str(value_bet.id),
                match_id=str(match.id),
                league=league_row.name,
                kickoff_at=match.kickoff_at,
                home_team=home.name,
                away_team=away.name,
                selection=SelectionOut(prediction.selection.value),
                bookmaker=odds.bookmaker.value,
                probability=value_bet.probability,
                bookmaker_odds=value_bet.bookmaker_odds,
                fair_odds=value_bet.fair_odds,
                ev=value_bet.ev,
                confidence_score=value_bet.confidence_score,
                recommendation_score=value_bet.recommendation_score,
            )
            for value_bet, match, league_row, home, away, prediction, odds in self.db.execute(stmt).all()
        ]

    def get_model_stats(self, model_version: Optional[str] = None) -> Optional[ModelStatsOut]:
        stmt = select(ModelMetrics).order_by(ModelMetrics.window_end.desc())
        if model_version:
            stmt = stmt.where(ModelMetrics.model_version == model_version)
        metric = self.db.scalar(stmt.limit(1))
        if metric is None:
            return None

        return ModelStatsOut(
            model_version=metric.model_version,
            roi=metric.roi,
            yield_rate=metric.yield_rate,
            clv=metric.clv,
            hit_rate=metric.hit_rate,
            max_drawdown=metric.max_drawdown,
            brier_score=metric.brier_score,
            sample_size=metric.sample_size,
        )
