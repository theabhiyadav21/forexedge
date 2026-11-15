from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    accounts = relationship("Account", back_populates="user")


class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    currency = Column(String, default="USD")
    initial_balance = Column(Float, default=1000.0)
    current_balance = Column(Float, default=1000.0)
    default_risk_pct = Column(Float, default=1.0)
    leverage = Column(Integer, default=100)
    account_type = Column(String, default="demo")
    user = relationship("User", back_populates="accounts")
    trades = relationship("Trade", back_populates="account")


class Strategy(Base):
    __tablename__ = "strategies"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    backtest_win_rate = Column(Float, nullable=True)
    backtest_avg_r = Column(Float, nullable=True)
    sample_size = Column(Integer, nullable=True)


class Trade(Base):
    __tablename__ = "trades"
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=True)
    mt5_ticket = Column(Integer, unique=True, nullable=True)  # <-- Ye line add ho gayi
    pair = Column(String, nullable=False)
    direction = Column(String)
    entry_price = Column(Float)
    stop_loss = Column(Float)
    take_profit = Column(Float)
    lot_size = Column(Float)
    risk_amount = Column(Float, nullable=True)
    planned_rr = Column(Float, nullable=True)
    exit_price = Column(Float, nullable=True)
    result = Column(String, default="open")
    r_multiple = Column(Float, nullable=True)
    pnl = Column(Float, nullable=True)
    session = Column(String, nullable=True)
    emotion = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    opened_at = Column(DateTime, server_default=func.now())
    closed_at = Column(DateTime, nullable=True)
    account = relationship("Account", back_populates="trades")