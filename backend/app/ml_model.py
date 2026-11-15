import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sqlalchemy.orm import Session
from . import models

def train_and_predict(db: Session, user_id: int, entry: float, sl: float, tp: float):
    # 1. User ki closed trades fetch karo
    trades = db.query(models.Trade).join(models.Account).filter(
        models.Account.user_id == user_id,
        models.Trade.result.in_(['win', 'loss'])
    ).all()

    if len(trades) < 5:
        return {"error": "Need at least 5 closed trades (win/loss) to predict."}

    # 2. Features (X) aur Labels (y) taiyar karo
    X = []
    y = []
    for t in trades:
        # Feature 1: Risk:Reward Ratio (Reward / Risk)
        risk = abs(t.entry_price - t.stop_loss)
        reward = abs(t.take_profit - t.entry_price)
        rr = reward / risk if risk > 0 else 1
        
        # Feature 2: Direction (Buy=1, Sell=0)
        direction = 1 if t.direction == 'buy' else 0
        
        X.append([rr, direction])
        y.append(1 if t.result == 'win' else 0)

    # 3. Data ko scale karo (Logistic Regression ke liye zaroori hai)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 4. Model Train karo
    model = LogisticRegression()
    model.fit(X_scaled, y)

    # 5. Naye trade ke liye predict karo
    new_risk = abs(entry - sl)
    new_reward = abs(tp - entry)
    new_rr = new_reward / new_risk if new_risk > 0 else 1
    new_direction = 1 if tp > entry else 0 # Agar TP entry se upar hai toh Buy

    new_X = scaler.transform([[new_rr, new_direction]])
    
    # Probability nikaalo (0.0 to 1.0)
    prob = model.predict_proba(new_X)[0][1]
    
    return {
        "win_probability": round(prob * 100, 2),
        "total_trades_analyzed": len(trades),
        "message": "Estimate based on past performance."
    }