from typing import Optional
from pydantic import BaseModel, Field

# --- [1] Product Code 스키마 ---
class ProductCodeBase(BaseModel):
    code_type: str = Field(..., max_length=50)
    code_value: str = Field(..., max_length=50)
    code_name: str = Field(..., max_length=100)
    code_sort_order: Optional[int] = None

class ProductCodeCreate(ProductCodeBase):
    pass

class ProductCodeResponse(ProductCodeBase):
    code_id: int
    class Config:
        from_attributes = True


class ProductMasterBase(BaseModel):
    part_number: str = Field(..., max_length=100, description="파트 넘버")
    is_active: Optional[bool] = Field(True, description="사용 여부")
    remarks: Optional[str] = Field(None, description="비고")

    # 실제 DB에 존재하는 value 컬럼만 유지
    category_value: Optional[str] = None
    datarate_value: Optional[str] = None
    package_value: Optional[str] = None
    distance_value: Optional[str] = None
    wavelength_value: Optional[str] = None
    temp_value: Optional[str] = None


class ProductMasterCreate(ProductMasterBase):
    pass

class ProductMasterResponse(ProductMasterBase):
    product_id: int
    class Config:
        from_attributes = True