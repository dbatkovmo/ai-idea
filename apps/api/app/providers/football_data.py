from __future__ import annotations

import json
from datetime import date, datetime, timedelta, timezone
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.core.config import Settings
from app.models.domain import MatchStatus
from app.providers.fixtures import ProviderFixture, ProviderLeague, ProviderTeam

STATUS_MAP = {
    "SCHEDULED": MatchStatus.scheduled,
    "TIMED": MatchStatus.scheduled,
    "IN_PLAY": MatchStatus.live,
    "PAUSED": MatchStatus.live,
    "FINISHED": MatchStatus.finished,
    "AWARDED": MatchStatus.finished,
    "POSTPONED": MatchStatus.postponed,
    "SUSPENDED": MatchStatus.postponed,
    "CANCELLED": MatchStatus.cancelled,
}


class FootballDataProviderError(RuntimeError):
    pass


class FootballDataFixturesProvider:
    name = "football-data"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def fetch_fixtures(self) -> list[ProviderFixture]:
        if not self.settings.football_data_key:
            raise FootballDataProviderError("FOOTBALL_DATA_KEY is required for real provider mode.")

        today = date.today()
        payload = self._get_json(
            f"/competitions/{self.settings.football_data_competition_code}/matches",
            {
                "dateFrom": today.isoformat(),
                "dateTo": (today + timedelta(days=self.settings.football_data_days_ahead)).isoformat(),
            },
        )
        if not payload.get("matches"):
            payload = self._get_json(f"/competitions/{self.settings.football_data_competition_code}/matches", {})
        return [self._normalize_match(match) for match in payload.get("matches", [])]

    def _get_json(self, path: str, query: dict[str, str]) -> dict[str, Any]:
        base_url = self.settings.football_data_base_url.rstrip("/")
        url = f"{base_url}{path}"
        if query:
            url = f"{url}?{urlencode(query)}"
        request = Request(url, headers={"X-Auth-Token": self.settings.football_data_key})

        try:
            with urlopen(request, timeout=20) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            details = exc.read().decode("utf-8", errors="replace")
            raise FootballDataProviderError(f"football-data.org returned HTTP {exc.code}: {details}") from exc
        except URLError as exc:
            raise FootballDataProviderError(f"football-data.org request failed: {exc.reason}") from exc

    def _normalize_match(self, match: dict[str, Any]) -> ProviderFixture:
        competition = match.get("competition") or {}
        area = match.get("area") or {}
        season = match.get("season") or {}
        home_team = match.get("homeTeam") or {}
        away_team = match.get("awayTeam") or {}
        score = match.get("score") or {}
        full_time_score = score.get("fullTime") or {}

        competition_code = str(competition.get("code") or competition.get("id") or "competition").lower()
        provider_id = str(match["id"])

        return ProviderFixture(
            provider_id=f"football-data:{provider_id}",
            league=ProviderLeague(
                provider_id=f"football-data:{competition.get('id')}",
                slug=f"football-data-{competition_code}",
                name=str(competition.get("name") or competition_code.upper()),
                country=str(area.get("name") or "Unknown"),
            ),
            home_team=ProviderTeam(
                provider_id=f"football-data:{home_team.get('id')}",
                name=str(home_team.get("name") or "Home team"),
            ),
            away_team=ProviderTeam(
                provider_id=f"football-data:{away_team.get('id')}",
                name=str(away_team.get("name") or "Away team"),
            ),
            season=str(season.get("startDate") or datetime.now(timezone.utc).year),
            kickoff_at=datetime.fromisoformat(str(match["utcDate"]).replace("Z", "+00:00")),
            status=STATUS_MAP.get(str(match.get("status")), MatchStatus.scheduled),
            home_score=full_time_score.get("home"),
            away_score=full_time_score.get("away"),
        )
