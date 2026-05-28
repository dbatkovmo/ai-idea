from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import ModelStatsOut
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("", response_model=ModelStatsOut)
def read_model_stats(
    model_version: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> ModelStatsOut:
    return AnalyticsService(db).get_model_stats(model_version=model_version)
