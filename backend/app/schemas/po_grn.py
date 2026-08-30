from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Purchase Order Schemas
class PurchaseOrderItemBase(BaseModel):
    item_description: str
    quantity: float
    unit_price: float
    total_price: float

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItemResponse(PurchaseOrderItemBase):
    id: int
    po_id: int

    class Config:
        from_attributes = True

class PurchaseOrderBase(BaseModel):
    po_number: str
    vendor_id: Optional[int] = None
    vendor_name: str
    order_date: datetime
    status: str = "OPEN"
    subtotal: float = 0.0
    tax_amount: float = 0.0
    total_amount: float = 0.0

class PurchaseOrderCreate(PurchaseOrderBase):
    items: List[PurchaseOrderItemCreate]

class PurchaseOrderResponse(PurchaseOrderBase):
    id: int
    created_at: datetime
    items: List[PurchaseOrderItemResponse] = []

    class Config:
        from_attributes = True

# Goods Receipt Schemas
class GoodsReceiptItemBase(BaseModel):
    item_description: str
    quantity_received: float
    quantity_accepted: float
    quantity_rejected: float = 0.0

class GoodsReceiptItemCreate(GoodsReceiptItemBase):
    pass

class GoodsReceiptItemResponse(GoodsReceiptItemBase):
    id: int
    grn_id: int

    class Config:
        from_attributes = True

class GoodsReceiptBase(BaseModel):
    grn_number: str
    po_number: str
    vendor_name: str
    receipt_date: datetime
    warehouse_location: Optional[str] = "Main Warehouse"
    received_by: Optional[str] = "Logistics Officer"
    notes: Optional[str] = None

class GoodsReceiptCreate(GoodsReceiptBase):
    items: List[GoodsReceiptItemCreate]

class GoodsReceiptResponse(GoodsReceiptBase):
    id: int
    created_at: datetime
    items: List[GoodsReceiptItemResponse] = []

    class Config:
        from_attributes = True
