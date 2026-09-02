from sqlalchemy import Column, Integer, Numeric, String, DateTime, Boolean, Text, ForeignKey
from app.database import Base

class PaymentTable(Base):
    __tablename__ = "payment"

    payment_id = Column(Integer, primary_key=True, index=True)
    payment_date = Column(DateTime, nullable=True)
    payment_amount = Column(Numeric, nullable=False)
    customer_id = Column(Integer, ForeignKey("customer_master.customer_id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("shipment_plan.plan_id"), nullable=True)
    remarks = Column(Text, nullable=True)
    commission_status = Column(String(50), nullable=True)
    is_selected = Column(Boolean, default=False, nullable=True)


class CommissionTable(Base):
    __tablename__ = "commission"

    commission_id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payment.payment_id"), nullable=True)  # 💡 수정된 외래키 반영
    commission_date = Column(DateTime, nullable=True)
    commission_rate = Column(Numeric, nullable=False)
    com_payment_subttl = Column(Numeric, nullable=True)
    claim_no = Column(String(100), nullable=True)
    claimed_date = Column(DateTime, nullable=True)
    paid_date = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=True)
    is_selected = Column(Boolean, default=False, nullable=True)
    remarks = Column(String(255), nullable=True)
