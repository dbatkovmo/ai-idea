from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.collectors.fixtures_collector import FixturesCollector
from app.collectors.odds_collector import OddsCollector
from app.core.database import get_db
from app.providers.football_data import FootballDataProviderError
from app.schemas.analytics import CollectorRunOut

router = APIRouter()


@router.post("/collect/fixtures", response_model=CollectorRunOut)
def collect_fixtures(db: Session = Depends(get_db)) -> CollectorRunOut:
    try:
        return CollectorRunOut(**FixturesCollector(db).collect().__dict__)
    except FootballDataProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/collect/odds", response_model=CollectorRunOut)
def collect_odds(db: Session = Depends(get_db)) -> CollectorRunOut:
    return CollectorRunOut(**OddsCollector(db).collect().__dict__)
