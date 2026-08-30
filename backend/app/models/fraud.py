from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    
    risk_score = Column(Float, default=0.0) # 0 to 100
    risk_level = Column(String, default="LOW") # LOW (0-20), MEDIUM (21-50), HIGH (51-75), CRITICAL (76-100)
    
    duplicate_suspicion_score = Column(Float, default=0.0)
    isolation_forest_anomaly = Column(String, default="NORMAL") # NORMAL, SUSPICIOUS, HIGHLY_SUSPICIOUS
    benford_law_deviation = Column(Float, default=0.0) # deviation score
    
    rules_triggered = Column(Text, nullable=True) # JSON list of rules triggered & breakdown
    explainable_summary = Column(Text, nullable=True) # Text narrative from AI Financial Investigation Assistant
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    invoice = relationship("Invoice", back_populates="fraud_alert")
