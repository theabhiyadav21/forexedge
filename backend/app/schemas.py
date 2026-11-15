from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PositionSizeRequest(BaseModel):
    balance: float
    risk_pct: float
    sl_pips: float
    pip_value_per_lot: float = 10.0


class PositionSizeResponse(BaseModel):
    risk_amount: float
    lot_size: float


class RRRequest(BaseModel):
    entry: float
    stop_loss: float
    take_profit: float
    direction: str = "buy"


class RRResponse(BaseModel):
    risk: float
    reward: float
    rr_ratio: float


class BreakevenRequest(BaseModel):
    rr_ratio: float


class BreakevenResponse(BaseModel):
    breakeven_win_rate: float


class ExpectancyRequest(BaseModel):
    win_rate: float
    avg_win: float
    avg_loss: float


class ExpectancyResponse(BaseModel):
    expectancy: float
    verdict: str


class KellyRequest(BaseModel):
    win_rate: float
    rr_ratio: float


class KellyResponse(BaseModel):
    kelly_pct: float
    recommended_risk_pct: float
    
# ---------- Auth Schemas ----------
class UserCreate(BaseModel):
    email: str
    password: str
    username: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ---------- Trade Schemas ----------
class TradeCreate(BaseModel):
    account_id: int
    pair: str
    direction: str
    entry_price: float
    stop_loss: float
    take_profit: float
    lot_size: float
    notes: Optional[str] = None

class TradeResponse(BaseModel):
    id: int
    account_id: int
    pair: str
    direction: str
    entry_price: float
    stop_loss: float
    take_profit: float
    lot_size: float
    result: str
    opened_at: datetime

    class Config:
        from_attributes = True
# ---------- Monte Carlo Schemas ----------
class MonteCarloRequest(BaseModel):
    win_rate: float          # e.g. 40 (for 40%)
    rr_ratio: float          # e.g. 2.0 (for 1:2)
    num_trades: int = 100    # kitne trades simulate karne hain
    risk_pct: float = 1.0    # per trade risk %
    simulations: int = 1000  # kitni baar simulate karna hai

class MonteCarloResponse(BaseModel):
    median_final_balance: float
    worst_5pct_balance: float
    best_5pct_balance: float
    median_max_drawdown_pct: float
    worst_max_drawdown_pct: float
# ---------- ML Schemas ----------
class MLPredictRequest(BaseModel):
    entry: float
    stop_loss: float
    take_profit: float

class MLPredictResponse(BaseModel):
    win_probability: Optional[float] = None
    total_trades_analyzed: Optional[int] = None
    message: Optional[str] = None
    error: Optional[str] = None
class TradeUpdate(BaseModel):
    exit_price: Optional[float] = None
    result: Optional[str] = None  # 'win', 'loss', 'breakeven'
    pnl: Optional[float] = None
    notes: Optional[str] = None
class TradeUpdate(BaseModel):
    exit_price: Optional[float] = None
    result: Optional[str] = None  # 'win', 'loss', 'breakeven'
    pnl: Optional[float] = None
    notes: Optional[str] = None   
# ---------- CSV Import Schema ----------
class CSVImportResponse(BaseModel):
    message: str
    imported_count: int
    skipped_count: int