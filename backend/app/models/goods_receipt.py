from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class GoodsReceipt(Base):
    __tablename__ = "goods_receipts"

    id = Column(Integer, primary_key=True, index=True)
    grn_number = Column(String, unique=True, index=True, nullable=False)
    po_number = Column(String, index=True, nullable=False)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True)
    vendor_name = Column(String, nullable=False)
    receipt_date = Column(DateTime, nullable=False)
    warehouse_location = Column(String, nullable=True)
    received_by = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    purchase_order = relationship("PurchaseOrder", back_populates="goods_receipts")
    items = relationship("GoodsReceiptItem", back_populates="goods_receipt", cascade="all, delete-orphan")

class GoodsReceiptItem(Base):
    __tablename__ = "goods_receipt_items"

    id = Column(Integer, primary_key=True, index=True)
    grn_id = Column(Integer, ForeignKey("goods_receipts.id"), nullable=False)
    item_description = Column(String, nullable=False)
    quantity_received = Column(Float, nullable=False)
    quantity_accepted = Column(Float, nullable=False)
    quantity_rejected = Column(Float, default=0.0)

    goods_receipt = relationship("GoodsReceipt", back_populates="items")
