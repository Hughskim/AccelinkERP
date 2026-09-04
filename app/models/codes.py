# app/models/codes.py

from sqlalchemy import Column, String, Integer, Boolean
from app.database import Base


# ---------------------------------------------------------
# 📌 통화 코드 (Currency Codes)
# ---------------------------------------------------------
class CurrencyCodes(Base):
    __tablename__ = "currency_codes"

    currency_code = Column(String(10), primary_key=True, index=True)
    currency_name = Column(String(50), nullable=True)
    symbol = Column(String(5), nullable=True)
    decimal_places = Column(Integer, default=2)
    is_active = Column(Boolean, default=True)


# ---------------------------------------------------------
# 📌 가격 타입 코드 (Price Type Codes)
# ---------------------------------------------------------
class PriceTypeCodes(Base):
    __tablename__ = "price_type_codes"

    type_code = Column(String(20), primary_key=True, index=True)
    type_name = Column(String(50), nullable=True)
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)


# ---------------------------------------------------------
# 📌 가격 정책 코드 (Price Policy Codes)
# ---------------------------------------------------------
class PricePolicyCodes(Base):
    __tablename__ = "price_policy_codes"

    policy_code = Column(String(20), primary_key=True, index=True)
    policy_name = Column(String(50), nullable=True)
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
