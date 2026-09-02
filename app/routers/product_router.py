from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.product import ProductCode, ProductMaster
from app.schemas.product_schema import (
    ProductCodeCreate, ProductCodeResponse,
    ProductMasterCreate, ProductMasterResponse
)

router = APIRouter()

# ----------------------------------------------------
# 📌 [1] 제품 코드(Product Code) 엔드포인트
# ----------------------------------------------------
@router.get("/codes", response_model=List[ProductCodeResponse], summary="전체 제품 코드 조회")
def get_product_codes(db: Session = Depends(get_db)):
    return db.query(ProductCode).order_by(ProductCode.code_id).all()

@router.post("/codes", response_model=ProductCodeResponse, status_code=status.HTTP_201_CREATED, summary="신규 제품 코드 등록")
def create_product_code(code_data: ProductCodeCreate, db: Session = Depends(get_db)):
    db_code = ProductCode(**code_data.model_dump())
    try:
        db.add(db_code)
        db.commit()
        db.refresh(db_code)
        return db_code
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# ----------------------------------------------------
# 📌 [2] 제품 마스터(Product Master) 엔드포인트
# ----------------------------------------------------
@router.get("/", response_model=List[ProductMasterResponse], summary="전체 제품 목록 조회")
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductMaster).order_by(ProductMaster.product_id).all()

@router.post("/", response_model=ProductMasterResponse, status_code=status.HTTP_201_CREATED, summary="신규 제품 등록")
def create_product(product_data: ProductMasterCreate, db: Session = Depends(get_db)):
    db_product = ProductMaster(**product_data.model_dump())
    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))