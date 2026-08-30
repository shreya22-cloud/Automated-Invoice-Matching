from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime, timezone
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String, nullable=True)
    role = Column(String, nullable=True)
    
    action = Column(String, nullable=False) # INVOICE_UPLOADED, INVOICE_MATCHED, DATA_CORRECTED, INVOICE_APPROVED, INVOICE_REJECTED, FRAUD_ALERT_GENERATED, PO_CREATED, SETTINGS_UPDATED
    target_entity = Column(String, nullable=False) # Invoice, PurchaseOrder, Vendor, SystemSetting
    entity_id = Column(String, nullable=True)
    
    change_details = Column(Text, nullable=True) # JSON or string description of changes/prior values
    ip_address = Column(String, nullable=True)
