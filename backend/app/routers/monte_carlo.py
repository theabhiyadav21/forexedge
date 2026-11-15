import random
from fastapi import APIRouter
from ..schemas import MonteCarloRequest, MonteCarloResponse

router = APIRouter(prefix="/api/advanced", tags=["Advanced"])

@router.post("/monte-carlo", response_model=MonteCarloResponse)
def run_monte_carlo(data: MonteCarloRequest):
    final_balances = []
    max_drawdowns = []

    # 1000 simulations run karo
    for _ in range(data.simulations):
        balance = 100.0  # Start with 100 units
        peak = 100.0
        max_dd = 0.0

        for _ in range(data.num_trades):
            # Win ya Loss decide karo
            if random.random() < (data.win_rate / 100):
                # Win
                profit = balance * (data.risk_pct / 100) * data.rr_ratio
                balance += profit
            else:
                # Loss
                loss = balance * (data.risk_pct / 100)
                balance -= loss

            # Drawdown calculate karo
            if balance > peak:
                peak = balance
            dd = ((peak - balance) / peak) * 100
            if dd > max_dd:
                max_dd = dd

        final_balances.append(balance)
        max_drawdowns.append(max_dd)

    # Results sort karo taaki percentiles nikal sakein
    final_balances.sort()
    max_drawdowns.sort()

    return MonteCarloResponse(
        median_final_balance=round(final_balances[len(final_balances)//2], 2),
        worst_5pct_balance=round(final_balances[int(len(final_balances)*0.05)], 2),
        best_5pct_balance=round(final_balances[int(len(final_balances)*0.95)], 2),
        median_max_drawdown_pct=round(max_drawdowns[len(max_drawdowns)//2], 2),
        worst_max_drawdown_pct=round(max_drawdowns[-1], 2)
    )
