from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.audit import AuditLog
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit Log"])

@router.get("/logs")
def get_audit_logs(
    action: Optional[str] = None,
    target_entity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if target_entity:
        query = query.filter(AuditLog.target_entity == target_entity)

    logs = query.order_by(AuditLog.id.desc()).all()
    return logs
