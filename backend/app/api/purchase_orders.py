from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from datetime import datetime

from app.database import get_db
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.vendor import Vendor
from app.models.user import User
from app.schemas.po_grn import PurchaseOrderCreate, PurchaseOrderResponse
from app.api.auth import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])

@router.post("", response_model=PurchaseOrderResponse)
def create_purchase_order(
    po_in: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "AUDITOR":
        raise HTTPException(status_code=403, detail="Auditors have read-only access.")

    existing = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_in.po_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"PO Number '{po_in.po_number}' already exists.")

    # Check or create vendor
    vendor = db.query(Vendor).filter(Vendor.name == po_in.vendor_name).first()
    if not vendor:
        vendor = Vendor(name=po_in.vendor_name)
        db.add(vendor)
        db.commit()
        db.refresh(vendor)

    po = PurchaseOrder(
        po_number=po_in.po_number,
        vendor_id=vendor.id,
        vendor_name=po_in.vendor_name,
        order_date=po_in.order_date,
        status=po_in.status,
        subtotal=po_in.subtotal,
        tax_amount=po_in.tax_amount,
        total_amount=po_in.total_amount
    )

    for item in po_in.items:
        po_item = PurchaseOrderItem(
            item_description=item.item_description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price
        )
        po.items.append(po_item)

    db.add(po)
    db.commit()
    db.refresh(po)

    AuditService.log_action(
        db=db,
        action="PO_CREATED",
        target_entity="PurchaseOrder",
        entity_id=str(po.id),
        user=current_user,
        change_details=f"Created PO #{po.po_number} for {po.vendor_name} total: ${po.total_amount:,.2f}"
    )

    return po

@router.get("", response_model=List[PurchaseOrderResponse])
def list_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(PurchaseOrder).order_by(PurchaseOrder.id.desc()).all()

@router.get("/{po_id}", response_model=PurchaseOrderResponse)
def get_purchase_order(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found.")
    return po

@router.post("/import-csv")
async def import_po_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "AUDITOR":
        raise HTTPException(status_code=403, detail="Auditors cannot import records.")

    contents = await file.read()
    decoded = contents.decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    
    count = 0
    for row in reader:
        po_num = row.get("po_number")
        if not po_num or db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_num).first():
            continue
        
        vendor_name = row.get("vendor_name", "CSV Imported Vendor")
        vendor = db.query(Vendor).filter(Vendor.name == vendor_name).first()
        if not vendor:
            vendor = Vendor(name=vendor_name)
            db.add(vendor)
            db.commit()
            db.refresh(vendor)

        subtotal = float(row.get("subtotal", 0.0))
        tax = float(row.get("tax", 0.0))
        total = float(row.get("total", subtotal + tax))

        po = PurchaseOrder(
            po_number=po_num,
            vendor_id=vendor.id,
            vendor_name=vendor_name,
            order_date=datetime.now(),
            subtotal=subtotal,
            tax_amount=tax,
            total_amount=total
        )
        db.add(po)
        count += 1

    db.commit()
    return {"status": "success", "imported_count": count}
