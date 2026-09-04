from sqlalchemy import Column, Integer, Numeric, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


# -----------------------------
# 현재 가격 테이블 (price)
# -----------------------------
class Price(Base):
    __tablename__ = "price"

    price_id = Column(Integer, primary_key=True, index=True)

    # FK
    product_id = Column(Integer, ForeignKey("product_master.product_id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customer_master.customer_id"), nullable=False)
    currency_code = Column(String(10), ForeignKey("currency_codes.currency_code"), nullable=True)
    price_type = Column(String(20), ForeignKey("price_type_codes.type_code"), nullable=True)
    price_policy = Column(String(20), ForeignKey("price_policy_codes.policy_code"), nullable=True)

    # 상태값
    is_active = Column(Boolean, default=True, nullable=True)

    # 관계 설정
    product = relationship("ProductMaster")
    customer = relationship("CustomerMaster")
    currency = relationship("CurrencyCodes")
    type = relationship("PriceTypeCodes")
    policy = relationship("PricePolicyCodes")

    # price_history 연결
    history = relationship("PriceHistory", back_populates="price")


# -----------------------------
# 가격 이력 테이블 (price_history)
# -----------------------------
class PriceHistory(Base):
    __tablename__ = "price_history"

    history_id = Column(Integer, primary_key=True, index=True)

    # FK
    price_id = Column(Integer, ForeignKey("price.price_id"), nullable=False)
    currency_code = Column(String(10), ForeignKey("currency_codes.currency_code"), nullable=True)
    price_type = Column(String(20), ForeignKey("price_type_codes.type_code"), nullable=True)
    price_policy = Column(String(20), ForeignKey("price_policy_codes.policy_code"), nullable=True)

    # 실제 가격 값
    price_value = Column(Numeric, nullable=False)
    price_quote = Column(Numeric, nullable=True)

    # 날짜
    price_date = Column(DateTime, nullable=False)

    # 생성 시각
    created_at = Column(DateTime, nullable=True)

    # 관계 설정
    price = relationship("Price", back_populates="history")
    currency = relationship("CurrencyCodes")
    type = relationship("PriceTypeCodes")
    policy = relationship("PricePolicyCodes")
