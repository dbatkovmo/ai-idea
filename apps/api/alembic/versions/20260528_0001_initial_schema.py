from __future__ import annotations

"""Initial analytics schema.

Revision ID: 20260528_0001
Revises:
Create Date: 2026-05-28
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260528_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

bookmaker_enum = postgresql.ENUM("fonbet", "winline", name="bookmaker", create_type=False)
market_enum = postgresql.ENUM("1x2", name="market", create_type=False)
match_status_enum = postgresql.ENUM(
    "scheduled", "live", "finished", "postponed", "cancelled", name="matchstatus", create_type=False
)
selection_enum = postgresql.ENUM("home", "draw", "away", name="selection", create_type=False)


def upgrade() -> None:
    bookmaker_enum.create(op.get_bind(), checkfirst=True)
    market_enum.create(op.get_bind(), checkfirst=True)
    match_status_enum.create(op.get_bind(), checkfirst=True)
    selection_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "leagues",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("country", sa.String(length=80), nullable=False),
        sa.Column("provider_id", sa.String(length=80), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_leagues_slug", "leagues", ["slug"], unique=True)

    op.create_table(
        "teams",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("league_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leagues.id"), nullable=False),
        sa.Column("name", sa.String(length=140), nullable=False),
        sa.Column("provider_id", sa.String(length=80), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("league_id", "name", name="uq_team_league_name"),
    )
    op.create_index("ix_teams_league_id", "teams", ["league_id"])
    op.create_index("ix_teams_name", "teams", ["name"])

    op.create_table(
        "matches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("provider_id", sa.String(length=80), nullable=True),
        sa.Column("league_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leagues.id"), nullable=False),
        sa.Column("season", sa.String(length=20), nullable=False),
        sa.Column("kickoff_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("home_team_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("teams.id"), nullable=False),
        sa.Column("away_team_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("teams.id"), nullable=False),
        sa.Column("status", match_status_enum, nullable=False),
        sa.Column("home_score", sa.Integer(), nullable=True),
        sa.Column("away_score", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("provider_id", name="uq_match_provider_id"),
    )
    op.create_index("ix_matches_away_team_id", "matches", ["away_team_id"])
    op.create_index("ix_matches_home_team_id", "matches", ["home_team_id"])
    op.create_index("ix_matches_kickoff_at", "matches", ["kickoff_at"])
    op.create_index("ix_matches_league_id", "matches", ["league_id"])
    op.create_index("ix_matches_season", "matches", ["season"])

    op.create_table(
        "match_stats",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("match_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("matches.id"), nullable=False),
        sa.Column("team_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("teams.id"), nullable=False),
        sa.Column("as_of", sa.DateTime(timezone=True), nullable=False),
        sa.Column("payload", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_match_stats_as_of", "match_stats", ["as_of"])
    op.create_index("ix_match_stats_match_id", "match_stats", ["match_id"])
    op.create_index("ix_match_stats_team_id", "match_stats", ["team_id"])

    op.create_table(
        "odds",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("match_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("matches.id"), nullable=False),
        sa.Column("bookmaker", bookmaker_enum, nullable=False),
        sa.Column("market", market_enum, nullable=False),
        sa.Column("selection", selection_enum, nullable=False),
        sa.Column("decimal_odds", sa.Float(), nullable=False),
        sa.Column("sampled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("match_id", "bookmaker", "market", "selection", name="uq_latest_odds"),
    )
    op.create_index("ix_odds_bookmaker", "odds", ["bookmaker"])
    op.create_index("ix_odds_match_id", "odds", ["match_id"])
    op.create_index("ix_odds_sampled_at", "odds", ["sampled_at"])
    op.create_index("ix_odds_selection", "odds", ["selection"])

    op.create_table(
        "odds_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("match_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("matches.id"), nullable=False),
        sa.Column("bookmaker", bookmaker_enum, nullable=False),
        sa.Column("market", market_enum, nullable=False),
        sa.Column("selection", selection_enum, nullable=False),
        sa.Column("decimal_odds", sa.Float(), nullable=False),
        sa.Column("sampled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source_payload", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_odds_history_bookmaker", "odds_history", ["bookmaker"])
    op.create_index("ix_odds_history_match_id", "odds_history", ["match_id"])
    op.create_index("ix_odds_history_sampled_at", "odds_history", ["sampled_at"])
    op.create_index("ix_odds_history_selection", "odds_history", ["selection"])

    op.create_table(
        "predictions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("match_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("matches.id"), nullable=False),
        sa.Column("model_version", sa.String(length=120), nullable=False),
        sa.Column("selection", selection_enum, nullable=False),
        sa.Column("probability", sa.Float(), nullable=False),
        sa.Column("prediction_cutoff", sa.DateTime(timezone=True), nullable=False),
        sa.Column("feature_snapshot", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("match_id", "model_version", "selection", name="uq_prediction_version"),
    )
    op.create_index("ix_predictions_match_id", "predictions", ["match_id"])
    op.create_index("ix_predictions_model_version", "predictions", ["model_version"])
    op.create_index("ix_predictions_prediction_cutoff", "predictions", ["prediction_cutoff"])
    op.create_index("ix_predictions_selection", "predictions", ["selection"])

    op.create_table(
        "value_bets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("match_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("matches.id"), nullable=False),
        sa.Column("prediction_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("predictions.id"), nullable=False),
        sa.Column("odds_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("odds.id"), nullable=False),
        sa.Column("probability", sa.Float(), nullable=False),
        sa.Column("bookmaker_odds", sa.Float(), nullable=False),
        sa.Column("fair_odds", sa.Float(), nullable=False),
        sa.Column("ev", sa.Float(), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=False),
        sa.Column("recommendation_score", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_value_bets_ev", "value_bets", ["ev"])
    op.create_index("ix_value_bets_match_id", "value_bets", ["match_id"])
    op.create_index("ix_value_bets_odds_id", "value_bets", ["odds_id"])
    op.create_index("ix_value_bets_prediction_id", "value_bets", ["prediction_id"])

    op.create_table(
        "model_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("model_version", sa.String(length=120), nullable=False),
        sa.Column("league_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leagues.id"), nullable=True),
        sa.Column("window_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("window_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("roi", sa.Float(), nullable=False),
        sa.Column("yield_rate", sa.Float(), nullable=False),
        sa.Column("clv", sa.Float(), nullable=False),
        sa.Column("hit_rate", sa.Float(), nullable=False),
        sa.Column("max_drawdown", sa.Float(), nullable=False),
        sa.Column("brier_score", sa.Float(), nullable=False),
        sa.Column("sample_size", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_model_metrics_model_version", "model_metrics", ["model_version"])
    op.create_index("ix_model_metrics_window_end", "model_metrics", ["window_end"])
    op.create_index("ix_model_metrics_window_start", "model_metrics", ["window_start"])


def downgrade() -> None:
    op.drop_index("ix_model_metrics_window_start", table_name="model_metrics")
    op.drop_index("ix_model_metrics_window_end", table_name="model_metrics")
    op.drop_index("ix_model_metrics_model_version", table_name="model_metrics")
    op.drop_table("model_metrics")
    op.drop_index("ix_value_bets_prediction_id", table_name="value_bets")
    op.drop_index("ix_value_bets_odds_id", table_name="value_bets")
    op.drop_index("ix_value_bets_match_id", table_name="value_bets")
    op.drop_index("ix_value_bets_ev", table_name="value_bets")
    op.drop_table("value_bets")
    op.drop_index("ix_predictions_selection", table_name="predictions")
    op.drop_index("ix_predictions_prediction_cutoff", table_name="predictions")
    op.drop_index("ix_predictions_model_version", table_name="predictions")
    op.drop_index("ix_predictions_match_id", table_name="predictions")
    op.drop_table("predictions")
    op.drop_index("ix_odds_history_selection", table_name="odds_history")
    op.drop_index("ix_odds_history_sampled_at", table_name="odds_history")
    op.drop_index("ix_odds_history_match_id", table_name="odds_history")
    op.drop_index("ix_odds_history_bookmaker", table_name="odds_history")
    op.drop_table("odds_history")
    op.drop_index("ix_odds_selection", table_name="odds")
    op.drop_index("ix_odds_sampled_at", table_name="odds")
    op.drop_index("ix_odds_match_id", table_name="odds")
    op.drop_index("ix_odds_bookmaker", table_name="odds")
    op.drop_table("odds")
    op.drop_index("ix_match_stats_team_id", table_name="match_stats")
    op.drop_index("ix_match_stats_match_id", table_name="match_stats")
    op.drop_index("ix_match_stats_as_of", table_name="match_stats")
    op.drop_table("match_stats")
    op.drop_index("ix_matches_season", table_name="matches")
    op.drop_index("ix_matches_league_id", table_name="matches")
    op.drop_index("ix_matches_kickoff_at", table_name="matches")
    op.drop_index("ix_matches_home_team_id", table_name="matches")
    op.drop_index("ix_matches_away_team_id", table_name="matches")
    op.drop_table("matches")
    op.drop_index("ix_teams_name", table_name="teams")
    op.drop_index("ix_teams_league_id", table_name="teams")
    op.drop_table("teams")
    op.drop_index("ix_leagues_slug", table_name="leagues")
    op.drop_table("leagues")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    selection_enum.drop(op.get_bind(), checkfirst=True)
    match_status_enum.drop(op.get_bind(), checkfirst=True)
    market_enum.drop(op.get_bind(), checkfirst=True)
    bookmaker_enum.drop(op.get_bind(), checkfirst=True)
