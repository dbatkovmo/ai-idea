from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.collectors.base import CollectorResult
from app.models.domain import Bookmaker, Market, Match, MatchStatus, Odds, OddsHistory, Prediction, ValueBet
from app.services.value_engine import calculate_value_signal


class OddsCollector:
    name = "odds"

    def __init__(self, db: Session) -> None:
        self.db = db

    def collect(self) -> CollectorResult:
        inserted = 0
        updated = 0
        skipped = 0
        sampled_at = datetime.now(timezone.utc).replace(microsecond=0)

        stmt = (
            select(Match, Prediction)
            .join(Prediction, Prediction.match_id == Match.id)
            .where(Match.status == MatchStatus.scheduled)
            .order_by(Match.kickoff_at.asc())
        )

        for match, prediction in self.db.execute(stmt).all():
            bookmaker = self._bookmaker_for_match(str(match.provider_id or match.id))
            decimal_odds = self._synthetic_odds(prediction.probability)

            odds = self.db.scalar(
                select(Odds).where(
                    Odds.match_id == match.id,
                    Odds.bookmaker == bookmaker,
                    Odds.market == Market.one_x_two,
                    Odds.selection == prediction.selection,
                )
            )
            if odds is None:
                odds = Odds(
                    match_id=match.id,
                    bookmaker=bookmaker,
                    market=Market.one_x_two,
                    selection=prediction.selection,
                    decimal_odds=decimal_odds,
                    sampled_at=sampled_at,
                )
                self.db.add(odds)
                self.db.flush()
                inserted += 1
            else:
                odds.decimal_odds = decimal_odds
                odds.sampled_at = sampled_at
                updated += 1

            self.db.add(
                OddsHistory(
                    match_id=match.id,
                    bookmaker=bookmaker,
                    market=Market.one_x_two,
                    selection=prediction.selection,
                    decimal_odds=decimal_odds,
                    sampled_at=sampled_at,
                    source_payload={"collector": self.name, "synthetic": True},
                )
            )
            self._upsert_value_bet(match, prediction, odds)

        if inserted == 0 and updated == 0:
            skipped += 1

        self.db.commit()
        return CollectorResult(
            collector=self.name,
            status="ok",
            inserted=inserted,
            updated=updated,
            skipped=skipped,
            notes=["Demo odds collector appended odds_history snapshots and refreshed latest odds."],
        )

    def _upsert_value_bet(self, match: Match, prediction: Prediction, odds: Odds) -> None:
        signal = calculate_value_signal(prediction.probability, odds.decimal_odds)
        existing = self.db.scalar(
            select(ValueBet).where(
                ValueBet.match_id == match.id,
                ValueBet.prediction_id == prediction.id,
                ValueBet.odds_id == odds.id,
            )
        )

        if signal.ev < 0.03:
            return

        if existing is None:
            self.db.add(
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
            return

        existing.probability = signal.probability
        existing.bookmaker_odds = signal.bookmaker_odds
        existing.fair_odds = signal.fair_odds
        existing.ev = signal.ev
        existing.confidence_score = signal.confidence_score
        existing.recommendation_score = signal.recommendation_score

    def _synthetic_odds(self, probability: float) -> float:
        edge_multiplier = 1.06
        return round((1 / probability) * edge_multiplier, 2)

    def _bookmaker_for_match(self, provider_id: str) -> Bookmaker:
        return Bookmaker.fonbet if sum(ord(char) for char in provider_id) % 2 == 0 else Bookmaker.winline
