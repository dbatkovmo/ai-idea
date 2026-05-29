from fastapi import APIRouter

from app.api.v1.routes import backtests, health, matches, model_stats, odds_movement, value_bets

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(matches.router, prefix="/matches", tags=["matches"])
api_router.include_router(odds_movement.router, tags=["odds movement"])
api_router.include_router(value_bets.router, prefix="/value-bets", tags=["value bets"])
api_router.include_router(model_stats.router, prefix="/model-stats", tags=["model stats"])
api_router.include_router(backtests.router, prefix="/backtests", tags=["backtests"])
