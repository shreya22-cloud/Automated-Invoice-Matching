from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from datetime import datetime

from app.database import get_db
from app.models.goods_receipt import GoodsReceipt, GoodsReceiptItem
from app.models.purchase_order import PurchaseOrder
from app.models.user import User
from app.schemas.po_grn import GoodsReceiptCreate, GoodsReceiptResponse
from app.api.auth import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/grn", tags=["Goods Receipt Notes"])

@router.post("", response_model=GoodsReceiptResponse)
def create_goods_receipt(
    grn_in: GoodsReceiptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "AUDITOR":
        raise HTTPException(status_code=403, detail="Auditors cannot create records.")

    existing = db.query(GoodsReceipt).filter(GoodsReceipt.grn_number == grn_in.grn_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"GRN Number '{grn_in.grn_number}' already exists.")

    po = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == grn_in.po_number).first()

    grn = GoodsReceipt(
        grn_number=grn_in.grn_number,
        po_number=grn_in.po_number,
        po_id=po.id if po else None,
        vendor_name=grn_in.vendor_name,
        receipt_date=grn_in.receipt_date,
        warehouse_location=grn_in.warehouse_location,
        received_by=grn_in.received_by,
        notes=grn_in.notes
    )

    for item in grn_in.items:
        grn_item = GoodsReceiptItem(
            item_description=item.item_description,
            quantity_received=item.quantity_received,
            quantity_accepted=item.quantity_accepted,
            quantity_rejected=item.quantity_rejected
        )
        grn.items.append(grn_item)

    db.add(grn)
    db.commit()
    db.refresh(grn)

    AuditService.log_action(
        db=db,
        action="GRN_CREATED",
        target_entity="GoodsReceipt",
        entity_id=str(grn.id),
        user=current_user,
        change_details=f"Created GRN #{grn.grn_number} for PO #{grn.po_number}"
    )

    return grn

@router.get("", response_model=List[GoodsReceiptResponse])
def list_goods_receipts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(GoodsReceipt).order_by(GoodsReceipt.id.desc()).all()

@router.get("/{grn_id}", response_model=GoodsReceiptResponse)
def get_goods_receipt(
    grn_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    grn = db.query(GoodsReceipt).filter(GoodsReceipt.id == grn_id).first()
    if not grn:
        raise HTTPException(status_code=404, detail="Goods Receipt Note not found.")
    return grn
