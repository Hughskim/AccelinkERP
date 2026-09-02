from sqlalchemy import Column, Integer, Numeric, String, DateTime, Boolean, ForeignKey
from app.database import Base

class PriceMaster(Base):
    __tablename__ = "price_master"

    price_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product_master.product_id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customer_master.customer_id"), nullable=False)
    price = Column(Numeric, nullable=False)
    quoted_price = Column(Numeric, nullable=False)
    price_date = Column(DateTime, nullable=True)
    remarks = Column(String(255), nullable=True)


class Price(Base):
    __tablename__ = "price"

    price_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product_master.product_id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customer_master.customer_id"), nullable=False)
    price_value = Column(Numeric, nullable=False)
    currency_code = Column(String(10), nullable=True)
    price_date = Column(DateTime, nullable=True)
    price_quote = Column(Numeric, nullable=True)
    is_active = Column(Boolean, default=True, nullable=True)


class PriceHistory(Base):
    __tablename__ = "price_history"

    history_id = Column(Integer, primary_key=True, index=True)
    price_id = Column(Integer, ForeignKey("price_master.price_id"), nullable=False)  # OR price.price_id 상황에 맞춰 바인딩 가능
    product_id = Column(Integer, ForeignKey("product_master.product_id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customer_master.customer_id"), nullable=False)
    change_date = Column(DateTime, nullable=True)
    old_price = Column(Numeric, nullable=True)
    new_price = Column(Numeric, nullable=True)
    old_quoted_price = Column(Numeric, nullable=True)
    new_quoted_price = Column(Numeric, nullable=True)
    remarks = Column(String(255), nullable=True)