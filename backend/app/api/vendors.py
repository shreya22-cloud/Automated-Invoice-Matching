from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.vendor import Vendor
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter(prefix="/vendors", tags=["Vendors"])

@router.get("")
def list_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Vendor).order_by(Vendor.id.desc()).all()

@router.post("")
def create_vendor(
    name: str,
    tax_id: str = None,
    email: str = None,
    phone: str = None,
    address: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "AUDITOR":
        raise HTTPException(status_code=403, detail="Auditors have read-only access.")

    vendor = Vendor(name=name, tax_id=tax_id, email=email, phone=phone, address=address)
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor
