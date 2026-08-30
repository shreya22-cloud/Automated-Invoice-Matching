from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MatchingResultResponse(BaseModel):
    """The persisted result of the invoice-to-PO-to-GRN comparison."""

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

    class Config:
        from_attributes = True

class InvoiceItemBase(BaseModel):
    item_description: str
    quantity: float
    unit_price: float
    tax: float = 0.0
    line_total: float
    confidence: float = 95.0

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItemResponse(InvoiceItemBase):
    id: int
    invoice_id: int

    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    invoice_number: str
    invoice_date: Optional[datetime] = None
    vendor_name: str
    vendor_tax_id: Optional[str] = None
    po_number: Optional[str] = None
    currency: str = "USD"
    subtotal: float = 0.0
    tax_amount: float = 0.0
    total_amount: float = 0.0

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate] = []

class InvoiceUpdate(BaseModel):
    invoice_number: Optional[str] = None
    vendor_name: Optional[str] = None
    vendor_tax_id: Optional[str] = None
    po_number: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    status: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    id: int
    vendor_id: Optional[int] = None
    ocr_confidence: float
    status: str
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    validation_status: str
    validation_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[InvoiceItemResponse] = []
    matching_result: Optional[MatchingResultResponse] = None

    class Config:
        from_attributes = True
