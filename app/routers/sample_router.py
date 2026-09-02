from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.sample import SampleMasterTable, SampleProcessTable
from app.schemas.sample_schema import (
    SampleMasterCreate, SampleMasterResponse,
    SampleProcessCreate, SampleProcessResponse
)

router = APIRouter()

# --- 📌 샘플 마스터 (Sample Master) ---
@router.get("/master", response_model=List[SampleMasterResponse], summary="전체 샘플 할당 목록 조회")
def get_sample_masters(db: Session = Depends(get_db)):
    return db.query(SampleMasterTable).order_by(SampleMasterTable.sample_id).all()

@router.post("/master", response_model=SampleMasterResponse, status_code=status.HTTP_201_CREATED, summary="신규 샘플 할당 등록")
def create_sample_master(master_data: SampleMasterCreate, db: Session = Depends(get_db)):
    db_master = SampleMasterTable(**master_data.model_dump())
    try:
        db.add(db_master)
        db.commit()
        db.refresh(db_master)
        return db_master
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# --- 📌 샘플 프로세스 추적 (Sample Process) ---
@router.get("/process", response_model=List[SampleProcessResponse], summary="전체 샘플 진행/추적 내역 조회")
def get_sample_processes(db: Session = Depends(get_db)):
    return db.query(SampleProcessTable).order_by(SampleProcessTable.process_id).all()

@router.post("/process", response_model=SampleProcessResponse, status_code=status.HTTP_201_CREATED, summary="신규 샘플 진행 단계 등록")
def create_sample_process(process_data: SampleProcessCreate, db: Session = Depends(get_db)):
    db_process = SampleProcessTable(**process_data.model_dump())
    try:
        db.add(db_process)
        db.commit()
        db.refresh(db_process)
        return db_process
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
