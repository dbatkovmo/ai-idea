from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import ValueBetOut
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("", response_model=list[ValueBetOut])
def get_value_bets(
    min_ev: float = Query(default=0.03, ge=0),
    league: Optional[str] = Query(default=None),
    bookmaker: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> list[ValueBetOut]:
    return AnalyticsService(db).list_value_bets(min_ev=min_ev, league=league, bookmaker=bookmaker)
