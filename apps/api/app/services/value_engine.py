from dataclasses import dataclass


@dataclass(frozen=True)
class ValueSignal:
    probability: float
    bookmaker_odds: float
    fair_odds: float
    ev: float
    confidence_score: float
    recommendation_score: float


def calculate_value_signal(probability: float, bookmaker_odds: float) -> ValueSignal:
    if probability <= 0 or probability >= 1:
        raise ValueError("probability must be between 0 and 1")
    if bookmaker_odds <= 1:
        raise ValueError("bookmaker_odds must be greater than 1")

    fair_odds = 1 / probability
    ev = (probability * bookmaker_odds) - 1
    confidence_score = min(1.0, max(0.0, probability * 0.72 + max(ev, 0) * 1.8))
    recommendation_score = min(100.0, max(0.0, ev * 720 + confidence_score * 28))

    return ValueSignal(
        probability=probability,
        bookmaker_odds=bookmaker_odds,
        fair_odds=fair_odds,
        ev=ev,
        confidence_score=confidence_score,
        recommendation_score=recommendation_score,
    )
