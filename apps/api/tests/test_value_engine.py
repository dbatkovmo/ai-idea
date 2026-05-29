import pytest

from app.services.value_engine import calculate_value_signal


def test_calculate_value_signal_returns_expected_ev_and_fair_odds() -> None:
    signal = calculate_value_signal(probability=0.58, bookmaker_odds=1.86)

    assert signal.fair_odds == pytest.approx(1.7241, rel=1e-4)
    assert signal.ev == pytest.approx(0.0788)
    assert 0 <= signal.confidence_score <= 1
    assert 0 <= signal.recommendation_score <= 100


@pytest.mark.parametrize("probability", [0, 1, -0.1, 1.1])
def test_calculate_value_signal_rejects_invalid_probability(probability: float) -> None:
    with pytest.raises(ValueError, match="probability"):
        calculate_value_signal(probability=probability, bookmaker_odds=2.0)


@pytest.mark.parametrize("bookmaker_odds", [1, 0.9])
def test_calculate_value_signal_rejects_invalid_bookmaker_odds(bookmaker_odds: float) -> None:
    with pytest.raises(ValueError, match="bookmaker_odds"):
        calculate_value_signal(probability=0.5, bookmaker_odds=bookmaker_odds)
