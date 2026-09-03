from sqlalchemy import Column, Integer, String, Boolean, Text
from app.database import Base

class ProductCode(Base):
    __tablename__ = "product_code"

    code_id = Column(Integer, primary_key=True, index=True)
    code_type = Column(String(50), nullable=False)
    code_value = Column(String(50), nullable=False)
    code_name = Column(String(100), nullable=False)
    code_sort_order = Column(Integer, nullable=True)


class ProductMaster(Base):
    # 실제 Neon DB의 테이블 이름과 매핑
    __tablename__ = "product_master"

    # Neon Console 명세서([image_N3RYK5.png]) 구조와 100% 일치하는 컬럼 선언
    product_id = Column(Integer, primary_key=True, index=True)
    part_number = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=True)
    remarks = Column(Text, nullable=True)
    
    # 공통 코드 구조 수용 필드
    category_value = Column(String(100), nullable=True)
    datarate_value = Column(String(100), nullable=True)
    package_value = Column(String(100), nullable=True)
    distance_value = Column(String(100), nullable=True)
    wavelength_value = Column(String(100), nullable=True)
    temp_value = Column(String(100), nullable=True)
