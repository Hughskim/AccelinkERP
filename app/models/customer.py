from sqlalchemy import Column, Integer, String
from app.database import Base  -- 프로젝트의 Base 선언 위치에 맞춰 가져옵니다.

class CustomerMaster(Base):
    __tablename__ = "customer_master"

    customer_id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(150), nullable=False)  -- NOT NULL 반영
    address = Column(String(255), nullable=True)
    country = Column(String(100), nullable=True)
    tel = Column(String(50), nullable=True)
    biz_type = Column(String(50), nullable=True)
    remarks = Column(String(255), nullable=True)