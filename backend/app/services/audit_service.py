import json
from typing import Any
from sqlalchemy.orm import Session
from app.models.audit import AuditLog
from app.models.user import User

class AuditService:
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        target_entity: str,
        entity_id: str,
        user: User = None,
        change_details: Any = None,
        ip_address: str = None
    ):
        """
        Creates an immutable audit log entry.
        """
        details_str = json.dumps(change_details) if isinstance(change_details, (dict, list)) else str(change_details or "")
        
        log_entry = AuditLog(
            user_id=user.id if user else None,
            user_name=user.full_name if user else "System Automated Process",
            role=user.role if user else "SYSTEM",
            action=action,
            target_entity=target_entity,
            entity_id=str(entity_id),
            change_details=details_str,
            ip_address=ip_address or "127.0.0.1"
        )
        db.add(log_entry)
        db.commit()
        return log_entry
