from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database import Base

class SampleMasterTable(Base):
    __tablename__ = "sample_master"

    sample_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer_master.customer_id"), nullable=True)
    product_id = Column(Integer, ForeignKey("product_master.product_id"), nullable=True)
    latest_rev_no = Column(String(255), nullable=True)
    created_date = Column(DateTime, nullable=True)
    updated_date = Column(DateTime, nullable=True)
    remarks = Column(String(255), nullable=True)


class SampleProcessTable(Base):
    __tablename__ = "sample_process"

    process_id = Column(Integer, primary_key=True, index=True)
    sample_id = Column(Integer, ForeignKey("sample_master.sample_id"), nullable=True)
    revision_no = Column(String(255), nullable=True)
    sample_qty = Column(Integer, nullable=True)
    sample_date = Column(DateTime, nullable=True)
    ship_date = Column(DateTime, nullable=True)
    delivery_date = Column(DateTime, nullable=True)
    approved_date = Column(DateTime, nullable=True)
    step_status = Column(String(255), nullable=True)
    remarks = Column(String(255), nullable=True)
