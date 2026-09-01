#AccelinkERP > schemas > customer_schema.py
from pydantic import BaseModel

class CustomerBase(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int

    class Config:
        orm_mode = True
