from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import json
from datetime import datetime

from app.database import get_db
from app.config import settings
from app.models.invoice import Invoice, InvoiceItem
from app.models.user import User
from app.schemas.invoice import InvoiceResponse, InvoiceUpdate
from app.api.auth import get_current_user
from app.services.ocr_service import OCRService
from app.services.extraction_service import ExtractionService
from app.services.validation_service import ValidationService
from app.services.matching_service import MatchingService
from app.services.fraud_detection import FraudDetectionService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.post("/upload", response_model=InvoiceResponse)
async def upload_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "AUDITOR":
        raise HTTPException(status_code=403, detail="Auditors have read-only access.")

    # Validate file extension
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = [".pdf", ".png", ".jpg", ".jpeg", ".txt", ".json"]
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(allowed_exts)}")

    # Read file content
    contents = await file.read()
    
    # Save file locally
    saved_filename = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    # 1. OCR Text Extraction
    raw_text = OCRService.extract_raw_text(contents, filename)

    # 2. Structured Field Extraction
    extracted = ExtractionService.parse_invoice_data(raw_text, filename)

    # 3. Data Validation
    val_result = ValidationService.validate_extracted_data(extracted, db)

    # Convert invoice_date string to datetime object
    inv_date_obj = None
    if extracted.get("invoice_date"):
        try:
            inv_date_obj = datetime.strptime(extracted["invoice_date"], "%Y-%m-%d")
        except ValueError:
            inv_date_obj = datetime.now()

    # Create Invoice Record
    new_invoice = Invoice(
        invoice_number=extracted["invoice_number"],
        invoice_date=inv_date_obj,
        vendor_name=extracted["vendor_name"],
        vendor_tax_id=extracted.get("vendor_tax_id"),
        po_number=extracted.get("po_number"),
        currency=extracted.get("currency", "USD"),
        subtotal=extracted["subtotal"],
        tax_amount=extracted["tax_amount"],
        total_amount=extracted["total_amount"],
        ocr_confidence=extracted["ocr_confidence"],
        status="EXTRACTED",
        file_path=file_path,
        file_name=filename,
        validation_status=val_result["validation_status"],
        validation_notes=json.dumps(val_result["checks"])
    )

    # Add Line Items
    for item in extracted.get("line_items", []):
        inv_item = InvoiceItem(
            item_description=item["description"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            tax=item.get("tax", 0.0),
            line_total=item["line_total"],
            confidence=item.get("confidence", 95.0)
        )
        new_invoice.items.append(inv_item)

    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    # 4. Trigger 3-Way Matching Engine
    MatchingService.perform_3way_matching(new_invoice, db)

    # 5. Trigger Multi-Layer Fraud Detection
    FraudDetectionService.analyze_invoice_fraud(new_invoice, db)

    # 6. Audit Logging
    AuditService.log_action(
        db=db,
        action="INVOICE_UPLOADED",
        target_entity="Invoice",
        entity_id=str(new_invoice.id),
        user=current_user,
        change_details=f"Uploaded '{filename}' -> Parsed Invoice #{new_invoice.invoice_number} Total: ${new_invoice.total_amount:,.2f}"
    )

    db.refresh(new_invoice)
    return new_invoice

@router.get("", response_model=List[InvoiceResponse])
def list_invoices(
    status: Optional[str] = None,
    vendor_name: Optional[str] = None,
    validation_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Invoice)
    if status:
        query = query.filter(Invoice.status == status)
    if vendor_name:
        query = query.filter(Invoice.vendor_name.ilike(f"%{vendor_name}%"))
    if validation_status:
        query = query.filter(Invoice.validation_status == validation_status)

    return query.order_by(Invoice.id.desc()).all()

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice_detail(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_in: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "AUDITOR":
        raise HTTPException(status_code=403, detail="Auditors cannot modify records.")

    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    update_data = invoice_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(invoice, field, val)

    db.commit()

    # Re-trigger matching & fraud pipeline after corrections
    MatchingService.perform_3way_matching(invoice, db)
    FraudDetectionService.analyze_invoice_fraud(invoice, db)

    AuditService.log_action(
        db=db,
        action="DATA_CORRECTED",
        target_entity="Invoice",
        entity_id=str(invoice.id),
        user=current_user,
        change_details=f"Extracted data corrected by user: {update_data}"
    )

    db.refresh(invoice)
    return invoice

@router.post("/{invoice_id}/approve")
def approve_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "AUDITOR":
        raise HTTPException(status_code=403, detail="Auditors cannot approve invoices.")

    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    previous_status = invoice.status
    invoice.status = "APPROVED"
    db.commit()

    AuditService.log_action(
        db=db,
        action="INVOICE_APPROVED",
        target_entity="Invoice",
        entity_id=str(invoice.id),
        user=current_user,
        change_details=f"Status updated from '{previous_status}' to 'APPROVED'."
    )

    return {"status": "success", "message": f"Invoice #{invoice.invoice_number} approved successfully."}

@router.post("/{invoice_id}/reject")
def reject_invoice(
    invoice_id: int,
    reason: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "AUDITOR":
        raise HTTPException(status_code=403, detail="Auditors cannot reject invoices.")

    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    previous_status = invoice.status
    invoice.status = "REJECTED"
    db.commit()

    AuditService.log_action(
        db=db,
        action="INVOICE_REJECTED",
        target_entity="Invoice",
        entity_id=str(invoice.id),
        user=current_user,
        change_details=f"Status updated from '{previous_status}' to 'REJECTED'. Reason: {reason or 'Not specified'}"
    )

    return {"status": "success", "message": f"Invoice #{invoice.invoice_number} rejected."}
