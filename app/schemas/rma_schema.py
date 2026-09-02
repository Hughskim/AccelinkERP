from typing import Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, Field

class RMABase(BaseModel):
    customer_id: Optional[int] = Field(None, description="고객사 ID")
    product_id: Optional[int] = Field(None, description="제품 ID")
    serial_number: Optional[str] = Field(None, max_length=255, description="시리얼 번호")
    issue_detail: Optional[str] = Field(None, max_length=255, description="불량 내용")
    issue_date: Optional[datetime] = Field(None, description="접수 일자")
    status: Optional[str] = Field(None, max_length=255, description="진행 상태")
    pickup_date: Optional[datetime] = Field(None, description="픽업 일자")
    ship_date: Optional[datetime] = Field(None, description="발송 일자")
    arrival_date: Optional[datetime] = Field(None, description="입고 일자")
    carrier: Optional[str] = Field(None, max_length=100, description="포워더/택배사")
    tracking_number: Optional[str] = Field(None, max_length=255, description="트래킹 번호")
    repair_start_date: Optional[datetime] = Field(None, description="수리 시작일")
    repair_end_date: Optional[datetime] = Field(None, description="수리 완료일")
    repair_vendor: Optional[str] = Field(None, max_length=255, description="수리 업체")
    repair_cost: Optional[Decimal] = Field(None, description="수리 비용")
    repair_report_no: Optional[str] = Field(None, max_length=255, description="리포트 번호")
    repair_summary: Optional[str] = Field(None, max_length=255, description="수리 내역 요약")
    return_ship_date: Optional[datetime] = Field(None, description="고객 반송일")
    return_carrier: Optional[str] = Field(None, max_length=255, description="반송 포워더")
    return_tracking_number: Optional[str] = Field(None, max_length=255, description="반송 트래킹 번호")
    remarks: Optional[str] = Field(None, max_length=255, description="비고")

class RMACreate(RMABase):
    pass

class rmaResponse(RMABase):
    rma_id: int
    class Config:
        from_attributes = True
