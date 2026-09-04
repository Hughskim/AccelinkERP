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
    PriceHistoryCreate, PriceHistoryResponse,
    PriceWithFirstHistoryCreate  # ✨ 추가된 복합 등록 스키마 임포트
)

router = APIRouter()

# ----------------------------------------------------
# 📌 [0] 가격 검색 API (명시적 경로 변경)
# ----------------------------------------------------
@router.get("/search", summary="제품 + 가격 검색")
def search_prices(keyword: str, db: Session = Depends(get_db)):
    if not keyword or not keyword.strip():
        return {"products": []}

    # 1) 제품 검색
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

    # 2) 제품별 가격 + 최신 이력 묶기
    result = []
    for p in products:
        prices = (
            db.query(Price)
            .filter(Price.product_id == p.product_id)
            .order_by(Price.price_id)
            .all()
        )

        extended_prices = []
        for price in prices:
            # 🏢 A. CustomerMaster 조인하여 실제 고객명 가져오기
            from app.models.customer import CustomerMaster
            customer = db.query(CustomerMaster).filter(CustomerMaster.customer_id == price.customer_id).first()
            customer_name = customer.customer_name if customer else f"미등록(ID {price.customer_id})"

            # 📈 B. PriceHistory 테이블에서 해당 price_id의 가장 최근(최신) 이력 1건 가져오기
            latest_history = (
                db.query(PriceHistory)
                .filter(PriceHistory.price_id == price.price_id)
                .order_by(PriceHistory.history_id.desc())
                .first()
            )

            # 🛠️ C. 실제 price 테이블 컬럼 구조와 최신 이력 데이터 병합
            price_dict = {
                "price_id": price.price_id,
                "product_id": price.product_id,
                "customer_id": price.customer_id,
                "customer_name": customer_name,
                "currency_code": price.currency_code,
                "price_type": price.price_type,
                "price_policy": price.price_policy,
                "is_active": price.is_active,
                
                "price_value": latest_history.price_value if latest_history else None,
                "price_quote": latest_history.price_quote if latest_history else None,
                "price_date": latest_history.price_date if latest_history else None
            }
            extended_prices.append(price_dict)

        result.append({
            "product": p,
            "prices": extended_prices
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
# 📌 [2] 현재 가격 정보 (Price 마스터 관리)
# ----------------------------------------------------
# 💡 대포 통합 등록 API: 마스터와 첫 가격 이력을 원자적으로 동시 등록 (추천 경로)
@router.post("/with-history", status_code=status.HTTP_201_CREATED, summary="신규 가격 마스터 + 이력 동시 등록")
def create_price_with_history(data: PriceWithFirstHistoryCreate, db: Session = Depends(get_db)):
    # 1. 중복 무결성 검사: 동일 제품 + 동일 고객 조합의 가격 마스터가 이미 존재하는지 체크
    existing_price = (
        db.query(Price)
        .filter(Price.product_id == data.product_id, Price.customer_id == data.customer_id)
        .first()
    )
    
    try:
        if existing_price:
            # 기존 마스터가 존재한다면 새로 만들지 않고, 그 price_id를 그대로 활용하여 이력만 쌓도록 유도하거나 처리 가능
            # 여기서는 비즈니스 원칙에 따라 신규 생성이므로 에러를 내거나 ID를 바인딩합니다.
            price_id = existing_price.price_id
            # 필요에 따라 활성화 여부를 True로 갱신해 줄 수도 있습니다.
            existing_price.is_active = True
            existing_price.currency_code = data.currency_code
            existing_price.price_type = data.price_type
            existing_price.price_policy = data.price_policy
        else:
            # 존재하지 않는다면 상위 마스터 레코드 신규 바인딩
            db_price = Price(
                product_id=data.product_id,
                customer_id=data.customer_id,
                currency_code=data.currency_code,
                price_type=data.price_type,
                price_policy=data.price_policy,
                is_active=True
            )
            db.add(db_price)
            db.flush()  # DB에 임시 반영하여 새로 생성된 price_id를 획득합니다.
            price_id = db_price.price_id

        # 2. 이력(PriceHistory) 테이블 데이터 인서트 구성
        db_history = PriceHistory(
            price_id=price_id,
            price_value=data.price_value,
            price_quote=data.price_quote,
            price_date=data.price_date,
            currency_code=data.currency_code,
            price_type=data.price_type,
            price_policy=data.price_policy
        )
        db.add(db_history)
        
        # 3. 최종 트랜잭션 일괄 커밋 (두 테이블 모두 안전하게 영구 저장)
        db.commit()
        return {"status": "success", "price_id": price_id, "message": "가격 마스터 및 이력이 성공적으로 일괄 등록되었습니다."}
        
    except Exception as e:
        db.rollback()  # 오류 발생 시 전부 취소(원자성 보장)
        print("🔥 DB INTEGRATION ERROR:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"등록 중 에러가 발생했습니다: {str(e)}")


@router.get("/", response_model=list[PriceResponse], summary="전체 가격 목록 조회")
def get_prices(db: Session = Depends(get_db)):
    return db.query(Price).order_by(Price.price_id).all()


@router.get("/{price_id}", response_model=PriceResponse, summary="특정 가격 조회")
def get_price(price_id: int, db: Session = Depends(get_db)):
    price = db.query(Price).filter(Price.price_id == price_id).first()
    if not price:
        raise HTTPException(status_code=404, detail="Price not found")
    return price


@router.post("/", response_model=PriceResponse, status_code=status.HTTP_201_CREATED, summary="신규 가격 단독 등록")
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
# 📌 [3] 가격 이력 (Price History 관리)
# ----------------------------------------------------
@router.get("/history", response_model=list[PriceHistoryResponse], summary="전체 가격 이력 조회")
def get_price_histories(db: Session = Depends(get_db)):
    return db.query(PriceHistory).order_by(PriceHistory.history_id).all()


@router.post("/history", response_model=PriceHistoryResponse, status_code=status.HTTP_201_CREATED, summary="가격 이력 단독 등록")
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
