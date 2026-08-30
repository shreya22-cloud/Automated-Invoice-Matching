from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db
from app.models.fraud import FraudAlert
from app.models.invoice import Invoice
from app.models.user import User
from app.schemas.fraud import FraudAlertResponse, BenfordDigitStat
from app.api.auth import get_current_user

router = APIRouter(prefix="/fraud", tags=["Fraud Detection Engine"])

@router.get("/alerts", response_model=List[FraudAlertResponse])
def get_fraud_alerts(
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FraudAlert)
    if risk_level:
        query = query.filter(FraudAlert.risk_level == risk_level.upper())
    return query.order_by(FraudAlert.risk_score.desc()).all()

@router.get("/invoice/{invoice_id}", response_model=FraudAlertResponse)
def get_invoice_fraud_detail(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(FraudAlert).filter(FraudAlert.invoice_id == invoice_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Fraud alert not found for this invoice.")
    return alert

@router.get("/benford-stats", response_model=List[BenfordDigitStat])
def get_benford_law_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    benford_expected = {1: 30.1, 2: 17.6, 3: 12.5, 4: 9.7, 5: 7.9, 6: 6.7, 7: 5.8, 8: 5.1, 9: 4.6}
    invoices = db.query(Invoice).all()

    first_digits = []
    for inv in invoices:
        val_str = str(int(abs(inv.total_amount)))
        for char in val_str:
            if char in "123456789":
                first_digits.append(int(char))
                break

    total_count = len(first_digits) if first_digits else 1

    stats = []
    for d in range(1, 10):
        cnt = first_digits.count(d)
        actual_pct = round((cnt / total_count) * 100.0, 1) if first_digits else 0.0
        stats.append(BenfordDigitStat(
            digit=d,
            expected_pct=benford_expected[d],
            actual_pct=actual_pct
        ))

    return stats
