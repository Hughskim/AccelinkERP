from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
import traceback

from app.database import get_db
from app.models.product import ProductMaster
from app.models.price import Price, PriceHistory
from app.models.codes import CurrencyCodes, PriceTypeCodes, PricePolicyCodes
from app.schemas.price_schema import (
    PriceCreate, PriceResponse,
    PriceHistoryCreate, PriceHistoryResponse
)

router = APIRouter()

# ----------------------------------------------------
# 📌 [0] 가격 검색 API (명시적 경로 변경)
# ----------------------------------------------------
# 경로 충돌을 방지하기 위해 주소를 "" 에서 "/search"로 변경했습니다.
@router.get("/search", summary="제품 + 가격 검색")
def search_prices(keyword: str, db: Session = Depends(get_db)):
    if not keyword or not keyword.strip():
        return {"products": []}

    # 1) 제품 검색 (product_router와 동일한 방식)
    products = (
        db.query(ProductMaster)
        .filter(
            or_(
                ProductMaster.part_number.ilike(f"%{keyword}%"),
                ProductMaster.category_value.ilike(f"%{keyword}%"),
                ProductMaster.package_value.ilike(f"%{keyword}%"),
                ProductMaster.datarate_value.ilike(f"%{keyword}%"),
                ProductMaster.temp_value.ilike(f"%{keyword}%"),
                ProductMaster.distance_value.ilike(f"%{keyword}%"),
                ProductMaster.wavelength_value.ilike(f"%{keyword}%"),
                ProductMaster.remarks.ilike(f"%{keyword}%"),
            )
        )
        .all()
    )

    # 2) 제품별 가격 리스트 묶기
    result = []
    for p in products:
        prices = (
            db.query(Price)
            .filter(Price.product_id == p.product_id)
            .order_by(Price.price_id)
            .all()
        )

        result.append({
            "product": p,
            "prices": prices
        })

    return {"products": result}


# ----------------------------------------------------
# 📌 [1] 가격 코드 엔드포인트 (통화/타입/정책)
# ----------------------------------------------------

@router.get("/codes/currency", response_model=list[str], summary="통화 코드 목록 조회")
def get_currency_codes(db: Session = Depends(get_db)):
    codes = db.query(CurrencyCodes).order_by(CurrencyCodes.currency_code).all()
    return [c.currency_code for c in codes]


@router.get("/codes/type", response_model=list[str], summary="가격 타입 코드 목록 조회")
def get_price_type_codes(db: Session = Depends(get_db)):
    codes = db.query(PriceTypeCodes).order_by(PriceTypeCodes.type_code).all()
    return [c.type_code for c in codes]


@router.get("/codes/policy", response_model=list[str], summary="가격 정책 코드 목록 조회")
def get_price_policy_codes(db: Session = Depends(get_db)):
    codes = db.query(PricePolicyCodes).order_by(PricePolicyCodes.policy_code).all()
    return [c.policy_code for c in codes]


# ----------------------------------------------------
# 📌 [2] 현재 가격 정보 (Price)
# ----------------------------------------------------

@router.get("/", response_model=list[PriceResponse], summary="전체 가격 목록 조회")
def get_prices(db: Session = Depends(get_db)):
    return db.query(Price).order_by(Price.price_id).all()


# 순서상 /{price_id} 보다 /history가 아래에 있으면 대상을 문자열/숫자로 오인하므로 이력을 위로 올리는 구조가 이상적입니다.
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

@router.get("/history", response_model=list[PriceHistoryResponse], summary="전체 가격 이력 조회")
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
