from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

# SQLAlchemy 모델
from app.models.customer import Customer

# Pydantic 모델
from app.schemas.customer_schema import CustomerCreate, CustomerResponse

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)

@router.get("/", response_model=list[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@router.post("/", response_model=CustomerResponse)
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
