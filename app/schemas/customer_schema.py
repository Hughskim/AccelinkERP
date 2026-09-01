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
        "from_attributes": True
    }
