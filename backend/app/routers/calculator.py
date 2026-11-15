from fastapi import APIRouter
from ..schemas import (
    PositionSizeRequest, PositionSizeResponse,
    RRRequest, RRResponse,
    BreakevenRequest, BreakevenResponse,
    ExpectancyRequest, ExpectancyResponse,
    KellyRequest, KellyResponse,
)

router = APIRouter(prefix="/api/calculator", tags=["Calculator"])


@router.post("/position-size", response_model=PositionSizeResponse)
def position_size(data: PositionSizeRequest):
    risk_amount = data.balance * (data.risk_pct / 100)
    lot_size = risk_amount / (data.sl_pips * data.pip_value_per_lot)
    return PositionSizeResponse(
        risk_amount=round(risk_amount, 2),
        lot_size=round(lot_size, 2)
    )


@router.post("/rr", response_model=RRResponse)
def risk_reward(data: RRRequest):
    if data.direction == "buy":
        risk = data.entry - data.stop_loss
        reward = data.take_profit - data.entry
    else:
        risk = data.stop_loss - data.entry
        reward = data.entry - data.take_profit
    if risk <= 0:
        return RRResponse(risk=risk, reward=reward, rr_ratio=0)
    return RRResponse(
        risk=round(risk, 5),
        reward=round(reward, 5),
        rr_ratio=round(reward / risk, 2)
    )


@router.post("/breakeven", response_model=BreakevenResponse)
def breakeven(data: BreakevenRequest):
    be = (1 / (1 + data.rr_ratio)) * 100
    return BreakevenResponse(breakeven_win_rate=round(be, 2))


@router.post("/expectancy", response_model=ExpectancyResponse)
def expectancy(data: ExpectancyRequest):
    wr = data.win_rate / 100
    exp = (wr * data.avg_win) - ((1 - wr) * data.avg_loss)
    return ExpectancyResponse(
        expectancy=round(exp, 2),
        verdict="profitable" if exp > 0 else "losing"
    )


@router.post("/kelly", response_model=KellyResponse)
def kelly(data: KellyRequest):
    wr = data.win_rate / 100
    loss_rate = 1 - wr
    kelly = wr - (loss_rate / data.rr_ratio) if data.rr_ratio > 0 else 0
    kelly_pct = max(kelly, 0) * 100
    return KellyResponse(
        kelly_pct=round(kelly_pct, 2),
        recommended_risk_pct=round(kelly_pct / 2, 2)
    )