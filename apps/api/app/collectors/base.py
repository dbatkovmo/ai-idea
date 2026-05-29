from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class CollectorResult:
    collector: str
    status: str
    inserted: int = 0
    updated: int = 0
    skipped: int = 0
    notes: list[str] = field(default_factory=list)
