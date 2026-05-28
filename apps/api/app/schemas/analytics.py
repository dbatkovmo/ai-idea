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
