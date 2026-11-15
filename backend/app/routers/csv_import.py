from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from .. import models, auth, schemas
from ..database import get_db
import pandas as pd
import io
from datetime import datetime

router = APIRouter(prefix="/api/csv", tags=["CSV Import"])

@router.post("/import", response_model=schemas.CSVImportResponse)
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")
    
    # User ka account dhundo
    account = db.query(models.Account).filter(
        models.Account.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    contents = await file.read()
    
    try:
        # CSV padho (MT4/MT5 format ke liye)
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    imported = 0
    skipped = 0

    # MT4/MT5 CSV columns alag hote hain, hum common columns check karenge
    # Typical format: 'Ticket', 'Open Time', 'Type', 'Size', 'Item', 'Price', 'S/L', 'T/P', 'Close Time', 'Profit'
    
    # Column names ko normalize (lowercase) karo
    df.columns = [c.strip().lower() for c in df.columns]

    for _, row in df.iterrows():
        try:
            # Check karo ki zaroori columns hain ya nahi
            ticket = row.get('ticket')
            if ticket is None: continue
            
            # Agar pehle se import hai toh skip karo
            existing = db.query(models.Trade).filter(
                models.Trade.mt5_ticket == int(ticket)
            ).first()
            if existing:
                skipped += 1
                continue

            # Data nikalo (MT5 format)
            trade_type = str(row.get('type', 'buy')).lower()
            direction = 'buy' if 'buy' in trade_type else 'sell'
            
            symbol = row.get('item', 'UNKNOWN')
            lot_size = float(row.get('size', 0))
            entry_price = float(row.get('price', 0))
            stop_loss = float(row.get('s/l', 0)) if pd.notna(row.get('s/l')) else 0
            take_profit = float(row.get('t/p', 0)) if pd.notna(row.get('t/p')) else 0
            
            profit = float(row.get('profit', 0))
            result = 'win' if profit > 0 else 'loss' if profit < 0 else 'breakeven'

            new_trade = models.Trade(
                account_id=account.id,
                mt5_ticket=int(ticket),
                pair=symbol,
                direction=direction,
                entry_price=entry_price,
                stop_loss=stop_loss,
                take_profit=take_profit,
                lot_size=lot_size,
                result=result,
                pnl=profit,
                notes="Imported from CSV",
                opened_at=datetime.now(),
                closed_at=datetime.now()
            )
            db.add(new_trade)
            imported += 1
        except Exception as e:
            skipped += 1
            continue

    db.commit()
    return {
        "message": "CSV Import successful",
        "imported_count": imported,
        "skipped_count": skipped
    }