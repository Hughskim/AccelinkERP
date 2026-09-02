from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from app.database import Base

class RMATable(Base):
    __tablename__ = "rma"

    # 1 ~ 3번 필드 (기본키 및 외래키)
    rma_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer_master.customer_id"), nullable=True)
    product_id = Column(Integer, ForeignKey("product_master.product_id"), nullable=True)
    
    # 4 ~ 10번 필드 (접수 및 불량 현황)
    serial_number = Column(String(255), nullable=True)
    issue_detail = Column(String(255), nullable=True)
    issue_date = Column(DateTime, nullable=True)
    status = Column(String(255), nullable=True)
    pickup_date = Column(DateTime, nullable=True)
    ship_date = Column(DateTime, nullable=True)
    arrival_date = Column(DateTime, nullable=True)
    
    # 11 ~ 14번 필드 (입고 운송 및 수리 일정)
    carrier = Column(String(100), nullable=True)
    tracking_number = Column(String(255), nullable=True)
    repair_start_date = Column(DateTime, nullable=True)
    repair_end_date = Column(DateTime, nullable=True)
    
    # 15 ~ 22번 필드 (수리 결과 및 반송 정보)
    repair_vendor = Column(String(255), nullable=True)
    repair_cost = Column(Numeric, nullable=True)
    repair_report_no = Column(String(255), nullable=True)
    repair_summary = Column(String(255), nullable=True)
    return_ship_date = Column(DateTime, nullable=True)
    return_carrier = Column(String(255), nullable=True)
    return_tracking_number = Column(String(255), nullable=True)
    remarks = Column(String(255), nullable=True)
