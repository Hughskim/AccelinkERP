from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field


# ---------------------------------------------------------
# 1) Price (현재 가격)
# ---------------------------------------------------------
class PriceBase(BaseModel):
    product_id: int
    customer_id: int
    currency_code: Optional[str] = Field(None, max_length=10)
    price_type: Optional[str] = Field(None, max_length=20)
    price_policy: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = True


class PriceCreate(PriceBase):
    pass


class PriceResponse(PriceBase):
    price_id: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------
# 2) PriceHistory (가격 이력)
# ---------------------------------------------------------
class PriceHistoryBase(BaseModel):
    price_id: int = Field(..., description="연관된 price 테이블의 ID")
    price_value: Decimal = Field(..., description="실제 가격 값")
    price_quote: Optional[Decimal] = Field(None, description="견적 가격")
    price_date: datetime = Field(..., description="가격 적용 날짜")

    currency_code: Optional[str] = Field(None, max_length=10)
    price_type: Optional[str] = Field(None, max_length=20)
    price_policy: Optional[str] = Field(None, max_length=20)

    created_at: Optional[datetime] = None


class PriceHistoryCreate(PriceHistoryBase):
    pass


class PriceHistoryResponse(PriceHistoryBase):
    history_id: int

    class Config:
        from_attributes = True

# 파일 최하단에 추가해 주세요

# ---------------------------------------------------------
# 3) 최초 가격 일괄 등록용 복합 스키마 (추천)
# ---------------------------------------------------------
class PriceWithFirstHistoryCreate(BaseModel):
    # 마스터 (Price) 영역
    product_id: int
    customer_id: int
    currency_code: str = Field(..., max_length=10, description="통화 (예: USD)")
    price_type: Optional[str] = Field(None, max_length=20, description="가격 타입")
    price_policy: Optional[str] = Field(None, max_length=20, description="가격 정책")
    
    # 최초 이력 (PriceHistory) 영역
    price_value: Decimal = Field(..., description="최초 실제 단가")
    price_quote: Optional[Decimal] = Field(None, description="최초 견적 단가")
    price_date: datetime = Field(default_factory=datetime.now, description="가격 승인/적용 날짜")
