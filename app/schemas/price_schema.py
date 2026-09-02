from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

# --- 1. Price Master 스키마 ---
class PriceMasterBase(BaseModel):
    product_id: int
    customer_id: int
    price: Decimal
    quoted_price: Decimal
    price_date: Optional[datetime] = None
    remarks: Optional[str] = Field(None, max_length=255)

class PriceMasterCreate(PriceMasterBase): pass
class PriceMasterResponse(PriceMasterBase):
    price_id: int
    class Config: from_attributes = True

# --- 2. Price 스키마 ---
class PriceBase(BaseModel):
    product_id: int
    customer_id: int
    price_value: Decimal
    currency_code: Optional[str] = Field(None, max_length=10)
    price_date: Optional[datetime] = None
    price_quote: Optional[Decimal] = None
    is_active: Optional[bool] = True

class PriceCreate(PriceBase): pass
class PriceResponse(PriceBase):
    price_id: int
    class Config: from_attributes = True

# --- 3. Price History (가격 변동 이력) 스키마 ---
class PriceHistoryBase(BaseModel):
    price_id: int = Field(..., description="연관 단가 ID")
    product_id: int = Field(..., description="제품 ID")
    customer_id: int = Field(..., description="고객사 ID")
    change_date: Optional[datetime] = Field(None, description="변경 일시")
    old_price: Optional[Decimal] = Field(None, description="변경 전 확정 단가")
    new_price: Optional[Decimal] = Field(None, description="변경 후 확정 단가")
    old_quoted_price: Optional[Decimal] = Field(None, description="변경 전 견적 단가")
    new_quoted_price: Optional[Decimal] = Field(None, description="변경 후 견적 단가")
    remarks: Optional[str] = Field(None, max_length=255, description="변경 사유/비고")

class PriceHistoryCreate(PriceHistoryBase): pass
class PriceHistoryResponse(PriceHistoryBase):
    history_id: int
    class Config: from_attributes = True