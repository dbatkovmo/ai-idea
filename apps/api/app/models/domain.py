from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum as PyEnum
from typing import Optional
from uuid import UUID as PythonUUID, uuid4

from sqlalchemy import DateTime, Enum as SqlEnum, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID as PgUUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MatchStatus(str, PyEnum):
    scheduled = "scheduled"
    live = "live"
    finished = "finished"
    postponed = "postponed"
    cancelled = "cancelled"


class Market(str, PyEnum):
    one_x_two = "1x2"


class Selection(str, PyEnum):
    home = "home"
    draw = "draw"
    away = "away"


class Bookmaker(str, PyEnum):
    fonbet = "fonbet"
    winline = "winline"


def enum_values(enum_cls: type[PyEnum]) -> list[str]:
    return [item.value for item in enum_cls]


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[PythonUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(40), default="analyst")


class League(Base, TimestampMixin):
    __tablename__ = "leagues"

    id: Mapped[PythonUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    country: Mapped[str] = mapped_column(String(80))
    provider_id: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)

    teams: Mapped[list["Team"]] = relationship(back_populates="league")
    matches: Mapped[list["Match"]] = relationship(back_populates="league")


class Team(Base, TimestampMixin):
    __tablename__ = "teams"
    __table_args__ = (UniqueConstraint("league_id", "name", name="uq_team_league_name"),)

    id: Mapped[PythonUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    league_id: Mapped[PythonUUID] = mapped_column(ForeignKey("leagues.id"), index=True)
    name: Mapped[str] = mapped_column(String(140), index=True)
    provider_id: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)

    league: Mapped[League] = relationship(back_populates="teams")


class Match(Base, TimestampMixin):
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("provider_id", name="uq_match_provider_id"),)

    id: Mapped[PythonUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    provider_id: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    league_id: Mapped[PythonUUID] = mapped_column(ForeignKey("leagues.id"), index=True)
    season: Mapped[str] = mapped_column(String(20), index=True)
    kickoff_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    home_team_id: Mapped[PythonUUID] = mapped_column(ForeignKey("teams.id"), index=True)
    away_team_id: Mapped[PythonUUID] = mapped_column(ForeignKey("teams.id"), index=True)
    status: Mapped[MatchStatus] = mapped_column(
        SqlEnum(MatchStatus, values_callable=enum_values), default=MatchStatus.scheduled
    )
    home_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    away_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    league: Mapped[League] = relationship(back_populates="matches")
    home_team: Mapped[Team] = relationship(foreign_keys=[home_team_id])
    away_team: Mapped[Team] = relationship(foreign_keys=[away_team_id])


class MatchStats(Base, TimestampMixin):
    __tablename__ = "match_stats"

    id: Mapped[PythonUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    match_id: Mapped[PythonUUID] = mapped_column(ForeignKey("matches.id"), index=True)
    team_id: Mapped[PythonUUID] = mapped_column(ForeignKey("teams.id"), index=True)
    as_of: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    payload: Mapped[dict] = mapped_column(JSONB, default=dict)


class Odds(Base, TimestampMixin):
    __tablename__ = "odds"
    __table_args__ = (
        UniqueConstraint("match_id", "bookmaker", "market", "selection", name="uq_latest_odds"),
    )

    id: Mapped[PythonUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    match_id: Mapped[PythonUUID] = mapped_column(ForeignKey("matches.id"), index=True)
    bookmaker: Mapped[Bookmaker] = mapped_column(SqlEnum(Bookmaker, values_callable=enum_values), index=True)
    market: Mapped[Market] = mapped_column(
        SqlEnum(Market, values_callable=enum_values), default=Market.one_x_two
    )
    selection: Mapped[Selection] = mapped_column(SqlEnum(Selection, values_callable=enum_values), index=True)
    decimal_odds: Mapped[float] = mapped_column(Float)
    sampled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class OddsHistory(Base, TimestampMixin):
    __tablename__ = "odds_history"

    id: Mapped[PythonUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    match_id: Mapped[PythonUUID] = mapped_column(ForeignKey("matches.id"), index=True)
    bookmaker: Mapped[Bookmaker] = mapped_column(SqlEnum(Bookmaker, values_callable=enum_values), index=True)
    market: Mapped[Market] = mapped_column(
        SqlEnum(Market, values_callable=enum_values), default=Market.one_x_two
    )
    selection: Mapped[Selection] = mapped_column(SqlEnum(Selection, values_callable=enum_values), index=True)
    decimal_odds: Mapped[float] = mapped_column(Float)
    sampled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    source_payload: Mapped[dict] = mapped_column(JSONB, default=dict)


class Prediction(Base, TimestampMixin):
    __tablename__ = "predictions"
    __table_args__ = (
        UniqueConstraint("match_id", "model_version", "selection", name="uq_prediction_version"),
    )

    id: Mapped[PythonUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    match_id: Mapped[PythonUUID] = mapped_column(ForeignKey("matches.id"), index=True)
    model_version: Mapped[str] = mapped_column(String(120), index=True)
    selection: Mapped[Selection] = mapped_column(SqlEnum(Selection, values_callable=enum_values), index=True)
    probability: Mapped[float] = mapped_column(Float)
    prediction_cutoff: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    feature_snapshot: Mapped[dict] = mapped_column(JSONB, default=dict)


class ValueBet(Base, TimestampMixin):
    __tablename__ = "value_bets"

    id: Mapped[PythonUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    match_id: Mapped[PythonUUID] = mapped_column(ForeignKey("matches.id"), index=True)
    prediction_id: Mapped[PythonUUID] = mapped_column(ForeignKey("predictions.id"), index=True)
    odds_id: Mapped[PythonUUID] = mapped_column(ForeignKey("odds.id"), index=True)
    probability: Mapped[float] = mapped_column(Float)
    bookmaker_odds: Mapped[float] = mapped_column(Float)
    fair_odds: Mapped[float] = mapped_column(Float)
    ev: Mapped[float] = mapped_column(Float, index=True)
    confidence_score: Mapped[float] = mapped_column(Float)
    recommendation_score: Mapped[float] = mapped_column(Float)


class ModelMetrics(Base, TimestampMixin):
    __tablename__ = "model_metrics"

    id: Mapped[PythonUUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True, default=uuid4)
    model_version: Mapped[str] = mapped_column(String(120), index=True)
    league_id: Mapped[Optional[PythonUUID]] = mapped_column(ForeignKey("leagues.id"), nullable=True)
    window_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    window_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    roi: Mapped[float] = mapped_column(Float)
    yield_rate: Mapped[float] = mapped_column(Float)
    clv: Mapped[float] = mapped_column(Float)
    hit_rate: Mapped[float] = mapped_column(Float)
    max_drawdown: Mapped[float] = mapped_column(Float)
    brier_score: Mapped[float] = mapped_column(Float)
    sample_size: Mapped[int] = mapped_column(Integer)
