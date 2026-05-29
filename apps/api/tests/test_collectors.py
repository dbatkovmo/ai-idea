from app.collectors.odds_collector import OddsCollector
from app.core.config import Settings
from app.models.domain import Bookmaker
from app.providers.football_data import FootballDataFixturesProvider


def test_synthetic_odds_adds_market_edge() -> None:
    collector = OddsCollector(db=None)  # type: ignore[arg-type]

    assert collector._synthetic_odds(0.5) == 2.12


def test_bookmaker_for_match_is_deterministic() -> None:
    collector = OddsCollector(db=None)  # type: ignore[arg-type]

    assert collector._bookmaker_for_match("collector-match-001") in {Bookmaker.fonbet, Bookmaker.winline}
    assert collector._bookmaker_for_match("collector-match-001") == collector._bookmaker_for_match(
        "collector-match-001"
    )


def test_football_data_provider_normalizes_match_payload() -> None:
    provider = FootballDataFixturesProvider(Settings(football_data_key="test-token"))

    fixture = provider._normalize_match(
        {
            "id": 501,
            "utcDate": "2026-06-01T18:30:00Z",
            "status": "SCHEDULED",
            "area": {"name": "England"},
            "competition": {"id": 2021, "code": "PL", "name": "Premier League"},
            "season": {"startDate": "2026-08-01"},
            "homeTeam": {"id": 61, "name": "Chelsea FC"},
            "awayTeam": {"id": 397, "name": "Brighton & Hove Albion FC"},
            "score": {"fullTime": {"home": None, "away": None}},
        }
    )

    assert fixture.provider_id == "football-data:501"
    assert fixture.league.slug == "football-data-pl"
    assert fixture.home_team.provider_id == "football-data:61"
    assert fixture.away_team.name == "Brighton & Hove Albion FC"
    assert fixture.kickoff_at.isoformat() == "2026-06-01T18:30:00+00:00"
