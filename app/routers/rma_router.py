from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.rma import RMATable
from app.schemas.rma_schema import RMACreate, rmaResponse

router = APIRouter()

@router.get("/", response_model=List[rmaResponse], summary="전체 RMA 접수 목록 조회")
def get_rmas(db: Session = Depends(get_db)):
    return db.query(RMATable).order_by(RMATable.rma_id).all()

@router.post("/", response_model=rmaResponse, status_code=status.HTTP_201_CREATED, summary="신규 RMA 건 등록")
def create_rma(rma_data: RMACreate, db: Session = Depends(get_db)):
    db_rma = RMATable(**rma_data.model_dump())
    try:
        db.add(db_rma)
        db.commit()
        db.refresh(db_rma)
        return db_rma
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")
