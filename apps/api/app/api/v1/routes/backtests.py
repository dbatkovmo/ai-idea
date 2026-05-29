from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import BacktestRunIn, BacktestResultOut
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.post("", response_model=BacktestResultOut)
def run_backtest(payload: BacktestRunIn, db: Session = Depends(get_db)) -> BacktestResultOut:
    return AnalyticsService(db).run_backtest(payload)


@router.get("/latest", response_model=BacktestResultOut)
def get_latest_backtest(db: Session = Depends(get_db)) -> BacktestResultOut:
    return AnalyticsService(db).get_latest_backtest()
