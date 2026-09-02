from typing import Optional
from pydantic import BaseModel, Field

# 📌 공통 필드 정의 (필드 크기 유효성 검사 적용)
class CustomerBase(BaseModel):
    customer_name: str = Field(..., max_length=150, description="고객사 이름")
    address: Optional[str] = Field(None, max_length=255, description="주소")
    country: Optional[str] = Field(None, max_length=100, description="국가")
    tel: Optional[str] = Field(None, max_length=50, description="전화번호")
    biz_type: Optional[str] = Field(None, max_length=50, description="거래처 구분")
    remarks: Optional[str] = Field(None, max_length=255, description="비고")

# 📥 고객 등록/수정 요청 시 사용 (ID는 DB에서 생성되므로 입력에서 제외)
class CustomerCreate(CustomerBase):
    pass

# 📤 API가 클라이언트에 데이터를 반환할 때 사용 (DB 결과 포맷팅)
class CustomerResponse(CustomerBase):
    customer_id: int

    class Config:
        from_attributes = True  -- SQLAlchemy 객체를 Pydantic이 자동으로 읽도록 설정