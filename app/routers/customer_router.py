#AccelinkERP > routers > customer_router.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.customer import Customer
from app.schemas.customer_schema import CustomerCreate, Customer

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)

@router.get("/", response_model=list[Customer])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@router.post("/", response_model=Customer)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    new_customer = Customer(
        name=customer.name,
        email=customer.email,
        phone=customer.phone
    )
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer
