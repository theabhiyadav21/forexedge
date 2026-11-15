from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, auth, ml_model , models
from ..database import get_db

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

@router.post("/predict", response_model=schemas.MLPredictResponse)
def predict_win_probability(
    data: schemas.MLPredictRequest, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    result = ml_model.train_and_predict(
        db=db, 
        user_id=current_user.id, 
        entry=data.entry, 
        sl=data.stop_loss, 
        tp=data.take_profit
    )
    return result