from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

# --- 1. Sample Master 스키마 ---
class SampleMasterBase(BaseModel):
    customer_id: Optional[int] = Field(None, description="고객사 ID")
    product_id: Optional[int] = Field(None, description="제품 ID")
    latest_rev_no: Optional[str] = Field(None, max_length=255, description="최신 리비전 번호")
    created_date: Optional[datetime] = Field(None, description="생성 일시")
    updated_date: Optional[datetime] = Field(None, description="수정 일시")
    remarks: Optional[str] = Field(None, max_length=255, description="비고")

class SampleMasterCreate(SampleMasterBase): pass
class SampleMasterResponse(SampleMasterBase):
    sample_id: int
    class Config: from_attributes = True


# --- 2. Sample Process 스키마 ---
class SampleProcessBase(BaseModel):
    sample_id: Optional[int] = Field(None, description="연관 샘플 마스터 ID")
    revision_no: Optional[str] = Field(None, max_length=255, description="리비전 번호")
    sample_qty: Optional[int] = Field(None, description="샘플 출하 수량")
    sample_date: Optional[datetime] = Field(None, description="샘플 처리 일자")
    ship_date: Optional[datetime] = Field(None, description="선적 일자")
    delivery_date: Optional[datetime] = Field(None, description="도착 일자")
    approved_date: Optional[datetime] = Field(None, description="승인 일자")
    step_status: Optional[str] = Field(None, max_length=255, description="단계별 진행 상태")
    remarks: Optional[str] = Field(None, max_length=255, description="비고")

class SampleProcessCreate(SampleProcessBase): pass
class SampleProcessResponse(SampleProcessBase):
    process_id: int
    class Config: from_attributes = True
