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


# --- [2] Product Master 스키마 ---
class ProductMasterBase(BaseModel):
    part_number: str = Field(..., max_length=100, description="파트 넘버")
    is_active: Optional[bool] = Field(True, description="사용 여부")
    remarks: Optional[str] = Field(None, description="비고")
    category_id: Optional[int] = Field(None, description="카테고리 ID")
    datarate_id: Optional[int] = Field(None, description="데이터레이트 ID")
    package_id: Optional[int] = Field(None, description="패키지 ID")
    distance_id: Optional[int] = Field(None, description="거리 ID")
    wavelength_id: Optional[int] = Field(None, description="파장 ID")
    temp_id: Optional[int] = Field(None, description="온도 ID")

class ProductMasterCreate(ProductMasterBase):
    pass

class ProductMasterResponse(ProductMasterBase):
    product_id: int
    class Config:
        from_attributes = True