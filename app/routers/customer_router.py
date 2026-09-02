from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# 이전에 만든 데이터베이스 세션, 모델, 스키마 가져오기
from app.database import get_db  -- 프로젝트의 DB 세션 생성 함수 위치 확인 필요
from app.models.customer import CustomerMaster
from app.schemas.customer_schema import CustomerCreate, CustomerResponse

router = APIRouter()

# 📋 1. 전체 고객 목록 조회 (GET /api/customers)
@router.get("/", response_model=List[CustomerResponse], summary="전체 고객 목록 조회")
def get_customers(db: Session = Depends(get_db)):
    """
    Neon PostgreSQL 데이터베이스에서 전체 고객 마스터 데이터를 조회합니다.
    """
    customers = db.query(CustomerMaster).order_by(CustomerMaster.customer_id).all()
    return customers


# 🔍 2. 특정 고객 상세 조회 (GET /api/customers/{customer_id})
@router.get("/{customer_id}", response_model=CustomerResponse, summary="특정 고객 상세 조회")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """
    고객 ID(customer_id)를 기준으로 단일 고객 정보를 상세 조회합니다.
    """
    customer = db.query(CustomerMaster).filter(CustomerMaster.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )
    return customer


# ➕ 3. 신규 고객 등록 (POST /api/customers)
@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED, summary="신규 고객 등록")
def create_customer(customer_data: CustomerCreate, db: Session = Depends(get_db)):
    """
    Pydantic으로 검증된 신규 고객 데이터를 받아 Neon 데이터베이스에 저장합니다.
    Access에서 마이그레이션 데이터를 밀어 넣을 때도 이 엔드포인트를 사용합니다.
    """
    # 스키마 데이터를 ORM 모델 객체로 변환
    db_customer = CustomerMaster(
        customer_name=customer_data.customer_name,
        address=customer_data.address,
        country=customer_data.country,
        tel=customer_data.tel,
        biz_type=customer_data.biz_type,
        remarks=customer_data.remarks
    )
    
    try:
        db.add(db_customer)
        db.commit()        -- 디비에 영구 반영
        db.refresh(db_customer)  -- 자동 생성된 customer_id 값을 받아오기 위해 리프레시
        return db_customer
    except Exception as e:
        db.rollback()      -- 에러 발생 시 롤백
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error occurred: {str(e)}"
        )