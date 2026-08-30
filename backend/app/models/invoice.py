from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, index=True, nullable=False)
    invoice_date = Column(DateTime, nullable=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    vendor_name = Column(String, nullable=False)
    vendor_tax_id = Column(String, nullable=True)
    po_number = Column(String, index=True, nullable=True)
    currency = Column(String, default="USD")
    
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    
    ocr_confidence = Column(Float, default=95.0) # percentage
    status = Column(String, default="UPLOADED") # UPLOADED, EXTRACTED, MATCHED, EXCEPTION, PENDING_REVIEW, APPROVED, REJECTED
    file_path = Column(String, nullable=True)
    file_name = Column(String, nullable=True)
    
    validation_status = Column(String, default="VALID") # VALID, WARNING, ERROR
    validation_notes = Column(Text, nullable=True) # JSON or descriptive text
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    vendor = relationship("Vendor", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    matching_result = relationship("MatchingResult", back_populates="invoice", uselist=False, cascade="all, delete-orphan")
    fraud_alert = relationship("FraudAlert", back_populates="invoice", uselist=False, cascade="all, delete-orphan")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    item_description = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    line_total = Column(Float, nullable=False)
    confidence = Column(Float, default=95.0)

    invoice = relationship("Invoice", back_populates="items")
