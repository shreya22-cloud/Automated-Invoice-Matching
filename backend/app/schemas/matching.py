from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MatchingResultResponse(BaseModel):
    id: int
    invoice_id: int
    vendor_matched: bool
    po_matched: bool
    grn_matched: bool
    quantity_matched: bool
    price_matched: bool
    total_matched: bool
    vendor_similarity_score: float
    po_similarity_score: float
    item_similarity_score: float
    overall_match_status: str
    match_details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
