from pydantic import BaseModel

class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str

class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str

    model_config = {
        "from_attributes": True  # Pydantic v2에서 orm_mode 대체
    }
