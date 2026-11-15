from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models, auth
from ..database import get_db
from datetime import timedelta

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # User ki saari trades fetch karo
    trades = db.query(models.Trade).join(models.Account).filter(
        models.Account.user_id == current_user.id
    ).order_by(models.Trade.opened_at.asc()).all()

    total_trades = len(trades)
    if total_trades == 0:
        return {
            "total_trades": 0,
            "win_rate": 0,
            "equity_curve": [],
            "r_distribution": []
        }

    # Win Rate aur PnL calculate karo
    wins = sum(1 for t in trades if t.result == 'win')
    win_rate = (wins / total_trades) * 100

    # Equity Curve Data (Starting balance 1000, har trade ke baad update)
    balance = 1000.0
    equity_curve = [{"name": "Start", "balance": balance}]
    
    # R-Multiple Distribution
    r_counts = {"< -1R": 0, "-1R": 0, "0R": 0, "1R": 0, "2R": 0, ">2R": 0}

    for i, t in enumerate(trades):
        # Fake PnL for now (agar trade win hai toh +100, loss hai toh -50)
        # Baad mein hum isko actual R-multiple se replace karenge
        trade_pnl = 100 if t.result == 'win' else -50 if t.result == 'loss' else 0
        balance += trade_pnl
        
        # Chart ke liye data point
        equity_curve.append({
            "name": f"Trade {i+1}",
            "balance": round(balance, 2)
        })

        # R-Multiple bucket mein daalo
        r = t.r_multiple if t.r_multiple else (2 if t.result == 'win' else -1 if t.result == 'loss' else 0)
        if r <= -1.5: r_counts["< -1R"] += 1
        elif r == -1: r_counts["-1R"] += 1
        elif r == 0: r_counts["0R"] += 1
        elif r == 1: r_counts["1R"] += 1
        elif r == 2: r_counts["2R"] += 1
        else: r_counts[">2R"] += 1

    r_distribution = [{"name": k, "trades": v} for k, v in r_counts.items()]

    return {
        "total_trades": total_trades,
        "win_rate": round(win_rate, 2),
        "equity_curve": equity_curve,
        "r_distribution": r_distribution
    }
@router.get("/risk-status")
def get_risk_status(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    from datetime import datetime, time
    today = datetime.now().date()
    
    
    trades_today = db.query(models.Trade).join(models.Account).filter(
        models.Account.user_id == current_user.id,
        models.Trade.closed_at >= datetime.combine(today, time.min),
        models.Trade.result.in_(['win', 'loss', 'breakeven'])
    ).all()

    
    daily_pnl = sum(t.pnl for t in trades_today if t.pnl is not None)
    
   
    status = "safe"
    message = "You are within your daily risk limits."
    
   
    if daily_pnl < -50: 
        status = "warning"
        message = "Warning: You have exceeded your daily loss limit of $50. Stop trading!"

    return {
        "daily_pnl": round(daily_pnl, 2),
        "status": status,
        "message": message
    }