from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from datetime import datetime

from app.database import get_db
from app.models.invoice import Invoice
from app.models.fraud import FraudAlert
from app.models.vendor import Vendor
from app.models.matching import MatchingResult
from app.models.user import User
from app.api.auth import get_current_user
from app.schemas.analytics import DashboardSummary, StatusDistribution, RiskDistribution, VendorStat

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_invoices = db.query(Invoice).count()
    approved = db.query(Invoice).filter(Invoice.status == "APPROVED").count()
    pending = db.query(Invoice).filter(Invoice.status.in_(["PENDING_REVIEW", "EXTRACTED", "EXCEPTION"])).count()
    rejected = db.query(Invoice).filter(Invoice.status == "REJECTED").count()
    
    high_risk = db.query(FraudAlert).filter(FraudAlert.risk_level.in_(["HIGH", "CRITICAL"])).count()
    
    total_amount_res = db.query(func.sum(Invoice.total_amount)).scalar() or 0.0
    
    matched_count = db.query(MatchingResult).filter(MatchingResult.overall_match_status.in_(["EXACT_MATCH", "ACCEPTABLE_VARIANCE"])).count()
    matching_rate = round((matched_count / total_invoices * 100.0), 1) if total_invoices > 0 else 100.0

    # Status distribution
    status_counts = db.query(Invoice.status, func.count(Invoice.id)).group_by(Invoice.status).all()
    status_dist = [{"name": s[0] or "UNKNOWN", "value": s[1]} for s in status_counts]

    # Risk distribution
    risk_counts = db.query(FraudAlert.risk_level, func.count(FraudAlert.id)).group_by(FraudAlert.risk_level).all()
    risk_dist = [{"name": r[0] or "LOW", "count": r[1]} for r in risk_counts]

    # Recent Invoices
    recent_invoices = db.query(Invoice).order_by(Invoice.id.desc()).limit(5).all()
    recent_list = []
    for inv in recent_invoices:
        alert = db.query(FraudAlert).filter(FraudAlert.invoice_id == inv.id).first()
        recent_list.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "vendor_name": inv.vendor_name,
            "total_amount": inv.total_amount,
            "status": inv.status,
            "validation_status": inv.validation_status,
            "risk_score": alert.risk_score if alert else 0.0,
            "risk_level": alert.risk_level if alert else "LOW",
            "date": inv.created_at.strftime("%Y-%m-%d")
        })

    return {
        "summary": {
            "total_invoices": total_invoices,
            "approved_invoices": approved,
            "pending_review": pending,
            "rejected_invoices": rejected,
            "high_risk_invoices": high_risk,
            "total_invoice_amount": round(total_amount_res, 2),
            "matching_success_rate": matching_rate
        },
        "status_distribution": status_dist,
        "risk_distribution": risk_dist,
        "recent_invoices": recent_list
    }

@router.get("/vendors", response_model=List[VendorStat])
def get_vendor_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendors = db.query(Vendor).all()
    stats = []
    for v in vendors:
        inv_count = db.query(Invoice).filter(Invoice.vendor_name.ilike(f"%{v.name}%")).count()
        tot_amount = db.query(func.sum(Invoice.total_amount)).filter(Invoice.vendor_name.ilike(f"%{v.name}%")).scalar() or 0.0
        stats.append(VendorStat(
            vendor_name=v.name,
            total_amount=round(tot_amount, 2),
            invoice_count=inv_count,
            risk_level=v.risk_tier
        ))
    return stats
