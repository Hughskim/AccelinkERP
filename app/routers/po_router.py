from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.po import POTable, BacklogTable, ShipmentPlanTable
from app.schemas.po_schema import (
    POCreate, POResponse, 
    BacklogResponse, 
    ShipmentPlanCreate, ShipmentPlanResponse
)

router = APIRouter()

# ----------------------------------------------------
# 📌 1. 수주(PO) 및 백로그(Backlog) 연동 영역
# ----------------------------------------------------
@router.get("/", response_model=List[POResponse], summary="전체 수주(PO) 목록 조회")
def get_pos(db: Session = Depends(get_db)):
    return db.query(POTable).order_by(POTable.po_id).all()

@router.post("/", response_model=POResponse, status_code=status.HTTP_201_CREATED, summary="신규 수주 등록 및 백로그 자동 생성")
def create_po_and_backlog(po_data: POCreate, db: Session = Depends(get_db)):
    db_po = POTable(**po_data.model_dump())
    try:
        db.add(db_po)
        db.flush()  # po_id 선발급
        
        db_backlog = BacklogTable(
            po_id=db_po.po_id,
            product_id=db_po.product_id,
            customer_id=db_po.customer_id,
            order_qty=db_po.po_qty,
            shipped_qty=0,
            balanced_qty=db_po.po_qty,
            due_date=db_po.due_date,
            status="Open"
        )
        db.add(db_backlog)
        db.commit()
        db.refresh(db_po)
        return db_po
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"PO-Backlog Transaction Failed: {str(e)}")

@router.get("/backlogs", response_model=List[BacklogResponse], summary="전체 백로그 현황 조회")
def get_backlogs(db: Session = Depends(get_db)):
    return db.query(BacklogTable).order_by(BacklogTable.backlog_id).all()

# ----------------------------------------------------
# 📌 2. 백로그 기반 선적 계획(Shipment Plan) 영역
# ----------------------------------------------------
@router.get("/shipments", response_model=List[ShipmentPlanResponse], summary="전체 선적 계획 조회")
def get_shipment_plans(db: Session = Depends(get_db)):
    return db.query(ShipmentPlanTable).order_by(ShipmentPlanTable.plan_id).all()

@router.post("/shipments", response_model=ShipmentPlanResponse, status_code=status.HTTP_201_CREATED, summary="백로그 기준 신규 선적(분할 선적) 계획 등록")
def create_shipment_plan(plan_data: ShipmentPlanCreate, db: Session = Depends(get_db)):
    db_plan = ShipmentPlanTable(**plan_data.model_dump())
    try:
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        return db_plan
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Shipment Plan Registration Failed: {str(e)}")
