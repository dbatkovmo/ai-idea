from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import MatchOut
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("", response_model=list[MatchOut])
def get_matches(
    league: Optional[str] = Query(default=None),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
    db: Session = Depends(get_db),
) -> list[MatchOut]:
    return AnalyticsService(db).list_matches(league=league, date_from=date_from, date_to=date_to)
