from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ProductCode(Base):
    __tablename__ = "product_code"

    code_id = Column(Integer, primary_key=True, index=True)
    code_type = Column(String(50), nullable=False)
    code_value = Column(String(50), nullable=False)
    code_name = Column(String(100), nullable=False)
    code_sort_order = Column(Integer, nullable=True)


class ProductMaster(Base):
    __tablename__ = "product_master"

    product_id = Column(Integer, primary_key=True, index=True)
    part_number = Column(String(100), nullable=False)  # NOT NULL 반영
    is_active = Column(Boolean, default=True, nullable=True)
    remarks = Column(Text, nullable=True)  # text 타입 반영
    
    # product_code 테이블과의 관계 설정 (외래키 제약조건)
    category_id = Column(Integer, ForeignKey("product_code.code_id"), nullable=True)
    datarate_id = Column(Integer, ForeignKey("product_code.code_id"), nullable=True)
    package_id = Column(Integer, ForeignKey("product_code.code_id"), nullable=True)
    distance_id = Column(Integer, ForeignKey("product_code.code_id"), nullable=True)
    wavelength_id = Column(Integer, ForeignKey("product_code.code_id"), nullable=True)
    temp_id = Column(Integer, ForeignKey("product_code.code_id"), nullable=True)