from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class MatchingResult(Base):
    __tablename__ = "matching_results"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    
    vendor_matched = Column(Boolean, default=False)
    po_matched = Column(Boolean, default=False)
    grn_matched = Column(Boolean, default=False)
    
    quantity_matched = Column(Boolean, default=False)
    price_matched = Column(Boolean, default=False)
    total_matched = Column(Boolean, default=False)
    
    vendor_similarity_score = Column(Float, default=0.0)
    po_similarity_score = Column(Float, default=0.0)
    item_similarity_score = Column(Float, default=0.0)
    
    overall_match_status = Column(String, default="NO_MATCH") # EXACT_MATCH, ACCEPTABLE_VARIANCE, EXCEPTION, NO_MATCH
    match_details = Column(Text, nullable=True) # JSON summary of mismatches or confirmation
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    invoice = relationship("Invoice", back_populates="matching_result")
