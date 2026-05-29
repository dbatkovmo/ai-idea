from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SelectionOut(str, Enum):
    home = "home"
    draw = "draw"
    away = "away"


class MatchOut(BaseModel):
    id: str
    league: str
    kickoff_at: datetime
    home_team: str
    away_team: str
    status: str
    home_probability: float = Field(ge=0, le=1)
    draw_probability: float = Field(ge=0, le=1)
    away_probability: float = Field(ge=0, le=1)


class ValueBetOut(BaseModel):
    id: str
    match_id: str
    league: str
    kickoff_at: datetime
    home_team: str
    away_team: str
    selection: SelectionOut
    bookmaker: str
    probability: float = Field(ge=0, le=1)
    bookmaker_odds: float = Field(gt=1)
    fair_odds: float = Field(gt=1)
    ev: float
    confidence_score: float = Field(ge=0, le=1)
    recommendation_score: float = Field(ge=0, le=100)


class ModelStatsOut(BaseModel):
    model_version: str
    roi: float
    yield_rate: float
    clv: float
    hit_rate: float
    max_drawdown: float
    brier_score: float
    sample_size: int


class OddsMovementPointOut(BaseModel):
    time: str
    opening: float = Field(gt=1)
    current: float = Field(gt=1)
    fair: float = Field(gt=1)


class BacktestRunIn(BaseModel):
    window: str = Field(default="90D")
    league: str | None = None
    model_version: str = Field(default="poisson-elo-v1")
    min_ev: float = Field(default=0.03, ge=0)


class ProfitCurvePointOut(BaseModel):
    period: str
    bankroll: float
    drawdown: float


class BacktestResultOut(BaseModel):
    id: str
    model_version: str
    window: str
    league: str
    roi: float
    clv: float
    max_drawdown: float
    hit_rate: float
    sample_size: int
    losing_streak: int
    profit_curve: list[ProfitCurvePointOut]
