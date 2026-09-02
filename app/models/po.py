from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from app.database import Base

class POTable(Base):
    __tablename__ = "po"

    po_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer_master.customer_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("product_master.product_id"), nullable=False)
    po_date = Column(DateTime, nullable=True)
    po_number = Column(String(100), nullable=False)
    po_qty = Column(Integer, nullable=False)
    po_price = Column(Numeric, nullable=False)
    due_date = Column(DateTime, nullable=True)
    cancel_date = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=True)
    remarks = Column(String(255), nullable=True)


class BacklogTable(Base):
    __tablename__ = "backlog"

    backlog_id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("po.po_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("product_master.product_id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customer_master.customer_id"), nullable=False)
    order_qty = Column(Integer, nullable=False)
    shipped_qty = Column(Integer, default=0, nullable=False)
    balanced_qty = Column(Integer, nullable=False)
    due_date = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=True)


class ShipmentPlanTable(Base):
    __tablename__ = "shipment_plan"

    plan_id = Column(Integer, primary_key=True, index=True)
    backlog_id = Column(Integer, ForeignKey("backlog.backlog_id"), nullable=False)
    plan_date = Column(DateTime, nullable=True)
    invoice_no = Column(String(100), nullable=True)
    plan_qty = Column(Integer, nullable=False)
    unit_price = Column(Numeric, nullable=False)
    amount = Column(Numeric, nullable=False)
    payment_status = Column(String(50), nullable=True)
    payment_total = Column(Numeric, nullable=True)
    remarks = Column(String(255), nullable=True)