from app.collectors.odds_collector import OddsCollector
from app.models.domain import Bookmaker


def test_synthetic_odds_adds_market_edge() -> None:
    collector = OddsCollector(db=None)  # type: ignore[arg-type]

    assert collector._synthetic_odds(0.5) == 2.12


def test_bookmaker_for_match_is_deterministic() -> None:
    collector = OddsCollector(db=None)  # type: ignore[arg-type]

    assert collector._bookmaker_for_match("collector-match-001") in {Bookmaker.fonbet, Bookmaker.winline}
    assert collector._bookmaker_for_match("collector-match-001") == collector._bookmaker_for_match(
        "collector-match-001"
    )
