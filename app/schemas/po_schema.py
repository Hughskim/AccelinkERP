from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

# --- 1. PO (수주) 스키마 ---
class POBase(BaseModel):
    customer_id: int
    product_id: int
    po_date: Optional[datetime] = None
    po_number: str = Field(..., max_length=100)
    po_qty: int
    po_price: Decimal
    due_date: Optional[datetime] = None
    cancel_date: Optional[datetime] = None
    status: Optional[str] = Field(None, max_length=50)
    remarks: Optional[str] = Field(None, max_length=255)

class POCreate(POBase): pass
class POResponse(POBase):
    po_id: int
    class Config: from_attributes = True

# --- 2. Backlog (수주 잔량) 스키마 ---
class BacklogBase(BaseModel):
    po_id: int
    product_id: int
    customer_id: int
    order_qty: int
    shipped_qty: int
    balanced_qty: int
    due_date: Optional[datetime] = None
    status: Optional[str] = Field(None, max_length=50)

class BacklogResponse(BacklogBase):
    backlog_id: int
    class Config: from_attributes = True

# --- 3. Shipment Plan (선적 계획) 스키마 ---
class ShipmentPlanBase(BaseModel):
    backlog_id: int
    plan_date: Optional[datetime] = None
    invoice_no: Optional[str] = Field(None, max_length=100)
    plan_qty: int
    unit_price: Decimal
    amount: Decimal
    payment_status: Optional[str] = Field(None, max_length=50)
    payment_total: Optional[Decimal] = None
    remarks: Optional[str] = Field(None, max_length=255)

class ShipmentPlanCreate(ShipmentPlanBase): pass
class ShipmentPlanResponse(ShipmentPlanBase):
    plan_id: int
    class Config: from_attributes = True