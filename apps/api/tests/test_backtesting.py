from app.services.mock_repository import get_backtest_result


def test_get_backtest_result_returns_profit_curve() -> None:
    result = get_backtest_result(window="90D", league="premier-league", min_ev=0.03)

    assert result.window == "90D"
    assert result.league == "Premier League"
    assert result.roi > 0
    assert result.sample_size > 0
    assert len(result.profit_curve) >= 2
