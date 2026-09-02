from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.payment import PaymentTable, CommissionTable
from app.schemas.payment_schema import (
    PaymentCreate, PaymentResponse,
    CommissionCreate, CommissionResponse
)

router = APIRouter()

# ----------------------------------------------------
# 📌 1. 수금 관리 (Payment) 영역
# ----------------------------------------------------
@router.get("/", response_model=List[PaymentResponse], summary="전체 수금(Payment) 목록 조회")
def get_payments(db: Session = Depends(get_db)):
    return db.query(PaymentTable).order_by(PaymentTable.payment_id).all()

@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED, summary="신규 수금 등록")
def create_payment(payment_data: PaymentCreate, db: Session = Depends(get_db)):
    db_payment = PaymentTable(**payment_data.model_dump())
    try:
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        return db_payment
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Payment Registration Failed: {str(e)}")


# ----------------------------------------------------
# 📌 2. 영업 수수료 관리 (Commission) 영역
# ----------------------------------------------------
@router.get("/commissions", response_model=List[CommissionResponse], summary="전체 커미션 정산 내역 조회")
def get_commissions(db: Session = Depends(get_db)):
    return db.query(CommissionTable).order_by(CommissionTable.commission_id).all()

@router.post("/commissions", response_model=CommissionResponse, status_code=status.HTTP_201_CREATED, summary="수금 기준 신규 커미션 등록")
def create_commission(com_data: CommissionCreate, db: Session = Depends(get_db)):
    # 💡 수금 ID가 유효한지 비즈니스 무결성 1차 검증
    if com_data.payment_id:
        parent_payment = db.query(PaymentTable).filter(PaymentTable.payment_id == com_data.payment_id).first()
        if not parent_payment:
            raise HTTPException(status_code=404, detail=f"Payment ID {com_data.payment_id} not found.")

    db_commission = CommissionTable(**com_data.model_dump())
    try:
        db.add(db_commission)
        
        # 💡 커미션이 정상 등록되면 부모 수금 건의 커미션 정산 상태를 자동으로 동기화 (선택 사항)
        if com_data.payment_id and parent_payment:
            parent_payment.commission_status = com_data.status or "Calculated"
            
        db.commit()
        db.refresh(db_commission)
        return db_commission
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Commission Registration Failed: {str(e)}")
