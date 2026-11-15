from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from datetime import datetime 

router = APIRouter(prefix="/api/trades", tags=["Trades"])

@router.post("/", response_model=schemas.TradeResponse)
def create_trade(
    trade: schemas.TradeCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    account = db.query(models.Account).filter(
        models.Account.id == trade.account_id,
        models.Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    new_trade = models.Trade(**trade.model_dump())
    db.add(new_trade)
    db.commit()
    db.refresh(new_trade)
    return new_trade

@router.get("/", response_model=List[schemas.TradeResponse])
def get_trades(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    trades = db.query(models.Trade).join(models.Account).filter(
        models.Account.user_id == current_user.id
    ).order_by(models.Trade.opened_at.desc()).all()
    return trades 
@router.put("/{trade_id}", response_model=schemas.TradeResponse)
def update_trade(
    trade_id: int,
    trade_update: schemas.TradeUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_trade = db.query(models.Trade).join(models.Account).filter(
        models.Trade.id == trade_id,
        models.Account.user_id == current_user.id
    ).first()

    if not db_trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    update_data = trade_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_trade, key, value)
    
    if trade_update.result in ['win', 'loss', 'breakeven']:
        from datetime import datetime
        db_trade.closed_at = datetime.now()

    db.commit()
    db.refresh(db_trade)
    return db_trade