from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.price import PriceMaster, Price, PriceHistory
from app.schemas.price_schema import (
    PriceMasterCreate, PriceMasterResponse,
    PriceCreate, PriceResponse,
    PriceHistoryCreate, PriceHistoryResponse
)

router = APIRouter()

# --- 📌 단가 마스터 (Price Master) ---
@router.get("/master", response_model=List[PriceMasterResponse], summary="전체 단가 마스터 조회")
def get_price_masters(db: Session = Depends(get_db)):
    return db.query(PriceMaster).order_by(PriceMaster.price_id).all()

@router.post("/master", response_model=PriceMasterResponse, status_code=status.HTTP_201_CREATED, summary="신규 단가 마스터 등록")
def create_price_master(price_data: PriceMasterCreate, db: Session = Depends(get_db)):
    db_price_master = PriceMaster(**price_data.model_dump())
    try:
        db.add(db_price_master)
        db.commit()
        db.refresh(db_price_master)
        return db_price_master
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 📌 고객사별 실거래가 정보 (Price) ---
@router.get("/", response_model=List[PriceResponse], summary="고객별 전체 가격 정보 조회")
def get_prices(db: Session = Depends(get_db)):
    return db.query(Price).order_by(Price.price_id).all()

@router.post("/", response_model=PriceResponse, status_code=status.HTTP_201_CREATED, summary="고객별 신규 가격 정보 등록")
def create_price(price_data: PriceCreate, db: Session = Depends(get_db)):
    db_price = Price(**price_data.model_dump())
    try:
        db.add(db_price)
        db.commit()
        db.refresh(db_price)
        return db_price
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- 📌 가격 변동 이력 추적 (Price History) ---
@router.get("/history", response_model=List[PriceHistoryResponse], summary="전체 가격 변동 이력 조회")
def get_price_histories(db: Session = Depends(get_db)):
    return db.query(PriceHistory).order_by(PriceHistory.history_id).all()

@router.post("/history", response_model=List[PriceHistoryResponse], status_code=status.HTTP_201_CREATED, summary="가격 변동 이력 등록")
def create_price_history(history_data: PriceHistoryCreate, db: Session = Depends(get_db)):
    db_history = PriceHistory(**history_data.model_dump())
    try:
        db.add(db_history)
        db.commit()
        db.refresh(db_history)
        return db_history
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))