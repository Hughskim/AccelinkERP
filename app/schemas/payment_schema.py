from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

# --- 1. Payment (수금) 스키마 ---
class PaymentBase(BaseModel):
    payment_date: Optional[datetime] = Field(None, description="수금 일자")
    payment_amount: Decimal = Field(..., description="수금 금액")
    customer_id: int = Field(..., description="고객사 ID")
    plan_id: Optional[int] = Field(None, description="연관 선적 계획 ID")
    remarks: Optional[str] = Field(None, description="비고")
    commission_status: Optional[str] = Field(None, max_length=50, description="커미션 정산 상태")
    is_selected: Optional[bool] = Field(False, description="선택 여부")

class PaymentCreate(PaymentBase): pass
class PaymentResponse(PaymentBase):
    payment_id: int
    class Config: from_attributes = True


# --- 2. Commission (커미션 정산) 스키마 ---
class CommissionBase(BaseModel):
    payment_id: Optional[int] = Field(None, description="연관 수금 ID")
    commission_date: Optional[datetime] = Field(None, description="커미션 산정일")
    commission_rate: Decimal = Field(..., description="수수료율 (예: 0.05)")
    com_payment_subttl: Optional[Decimal] = Field(None, description="커미션 소계 금액")
    claim_no: Optional[str] = Field(None, max_length=100, description="청구 번호")
    claimed_date: Optional[datetime] = Field(None, description="청구 일자")
    paid_date: Optional[datetime] = Field(None, description="지급 완료일")
    status: Optional[str] = Field(None, max_length=50, description="정산 상태")
    is_selected: Optional[bool] = Field(False, description="선택 여부")
    remarks: Optional[str] = Field(None, max_length=255, description="비고")

class CommissionCreate(CommissionBase): pass
class CommissionResponse(CommissionBase):
    commission_id: int
    class Config: from_attributes = True
