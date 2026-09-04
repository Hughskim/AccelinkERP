from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import traceback

from app.database import get_db
from app.models.price import Price, PriceHistory
from app.models.codes import CurrencyCodes, PriceTypeCodes, PricePolicyCodes
from app.schemas.price_schema import (
    PriceCreate, PriceResponse,
    PriceHistoryCreate, PriceHistoryResponse
)

router = APIRouter()

# ----------------------------------------------------
# 📌 [1] 가격 코드 엔드포인트 (통화/타입/정책)
# ----------------------------------------------------

@router.get("/codes/currency", response_model=List[str], summary="통화 코드 목록 조회")
def get_currency_codes(db: Session = Depends(get_db)):
    codes = db.query(CurrencyCodes).order_by(CurrencyCodes.currency_code).all()
    return [c.currency_code for c in codes]


@router.get("/codes/type", response_model=List[str], summary="가격 타입 코드 목록 조회")
def get_price_type_codes(db: Session = Depends(get_db)):
    codes = db.query(PriceTypeCodes).order_by(PriceTypeCodes.type_code).all()
    return [c.type_code for c in codes]


@router.get("/codes/policy", response_model=List[str], summary="가격 정책 코드 목록 조회")
def get_price_policy_codes(db: Session = Depends(get_db)):
    codes = db.query(PricePolicyCodes).order_by(PricePolicyCodes.policy_code).all()
    return [c.policy_code for c in codes]


# ----------------------------------------------------
# 📌 [2] 현재 가격 정보 (Price)
# ----------------------------------------------------

@router.get("/", response_model=List[PriceResponse], summary="전체 가격 목록 조회")
def get_prices(db: Session = Depends(get_db)):
    return db.query(Price).order_by(Price.price_id).all()


@router.get("/{price_id}", response_model=PriceResponse, summary="특정 가격 조회")
def get_price(price_id: int, db: Session = Depends(get_db)):
    price = db.query(Price).filter(Price.price_id == price_id).first()
    if not price:
        raise HTTPException(status_code=404, detail="Price not found")
    return price


@router.post("/", response_model=PriceResponse, status_code=status.HTTP_201_CREATED, summary="신규 가격 등록")
def create_price(price_data: PriceCreate, db: Session = Depends(get_db)):
    db_price = Price(**price_data.model_dump())

    try:
        db.add(db_price)
        db.commit()
        db.refresh(db_price)
        return db_price
    except Exception as e:
        db.rollback()
        print("🔥 DB ERROR:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------------------------------
# 📌 [3] 가격 이력 (Price History)
# ----------------------------------------------------

@router.get("/history", response_model=List[PriceHistoryResponse], summary="전체 가격 이력 조회")
def get_price_histories(db: Session = Depends(get_db)):
    return db.query(PriceHistory).order_by(PriceHistory.history_id).all()


@router.post("/history", response_model=PriceHistoryResponse, status_code=status.HTTP_201_CREATED, summary="가격 이력 등록")
def create_price_history(history_data: PriceHistoryCreate, db: Session = Depends(get_db)):
    db_history = PriceHistory(**history_data.model_dump())

    try:
        db.add(db_history)
        db.commit()
        db.refresh(db_history)
        return db_history
    except Exception as e:
        db.rollback()
        print("🔥 DB ERROR:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
