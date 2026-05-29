from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.domain import Bookmaker, Selection
from app.schemas.analytics import OddsMovementPointOut
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/matches/{match_id}/odds-movement", response_model=list[OddsMovementPointOut])
def get_odds_movement(
    match_id: str,
    bookmaker: Optional[Bookmaker] = Query(default=None),
    selection: Optional[Selection] = Query(default=None),
    db: Session = Depends(get_db),
) -> list[OddsMovementPointOut]:
    return AnalyticsService(db).get_odds_movement(
        match_id=match_id,
        bookmaker=bookmaker,
        selection=selection,
    )
