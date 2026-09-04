from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import traceback

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

# 전체 코드 조회
@router.get("/codes", response_model=List[ProductCodeResponse], summary="전체 제품 코드 조회")
def get_product_codes(db: Session = Depends(get_db)):
    return db.query(ProductCode).order_by(ProductCode.code_id).all()


# code_type별 코드 조회 (프론트엔드 드롭다운용)
@router.get("/codes/{code_type}", response_model=List[ProductCodeResponse], summary="코드 타입별 조회")
def get_codes_by_type(code_type: str, db: Session = Depends(get_db)):
    codes = (
        db.query(ProductCode)
        .filter(ProductCode.code_type == code_type)
        .order_by(ProductCode.code_id)
        .all()
    )
    return codes


# 신규 코드 등록
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

# 전체 제품 목록 조회
@router.get("/", response_model=List[ProductMasterResponse], summary="전체 제품 목록 조회")
def get_products(db: Session = Depends(get_db)):
    return db.query(ProductMaster).order_by(ProductMaster.product_id).all()


# 특정 제품 조회 (edit 페이지용)
@router.get("/{product_id}", response_model=ProductMasterResponse, summary="특정 제품 조회")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(ProductMaster)
        .filter(ProductMaster.product_id == product_id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# 신규 제품 등록
@router.post("/", response_model=ProductMasterResponse, status_code=status.HTTP_201_CREATED, summary="신규 제품 등록")
def create_product(product_data: ProductMasterCreate, db: Session = Depends(get_db)):
    try:
        db_product = ProductMaster(**product_data.model_dump())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# 제품 수정 (edit 페이지 저장)
@router.put("/{product_id}", response_model=ProductMasterResponse, summary="제품 수정")
def update_product(product_id: int, product_data: ProductMasterCreate, db: Session = Depends(get_db)):
    product = (
        db.query(ProductMaster)
        .filter(ProductMaster.product_id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 필드 업데이트
    for key, value in product_data.model_dump().items():
        setattr(product, key, value)

    try:
        db.commit()
        db.refresh(product)
        return product
    except Exception as e:
        db.rollback()
        print("🔥 DB ERROR:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))