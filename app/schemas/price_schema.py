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
