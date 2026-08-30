from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.settings import SystemSetting
from app.models.user import User
from app.schemas.settings import SystemThresholdsUpdate
from app.api.auth import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/settings", tags=["System Settings"])

@router.get("")
def get_system_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = db.query(SystemSetting).all()
    # Format into key-value map for frontend convenience
    setting_map = {}
    for s in settings:
        setting_map[s.key] = s.value
    return {
        "amount_tolerance_pct": float(setting_map.get("amount_tolerance_pct", 0.5)),
        "quantity_tolerance_units": float(setting_map.get("quantity_tolerance_units", 1.0)),
        "fuzzy_similarity_threshold_pct": float(setting_map.get("fuzzy_similarity_threshold_pct", 80.0)),
        "raw_settings": settings
    }

@router.put("/thresholds")
def update_thresholds(
    thresholds: SystemThresholdsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Only Admins can modify system matching thresholds.")

    updates = {
        "amount_tolerance_pct": str(thresholds.amount_tolerance_pct),
        "quantity_tolerance_units": str(thresholds.quantity_tolerance_units),
        "fuzzy_similarity_threshold_pct": str(thresholds.fuzzy_similarity_threshold_pct)
    }

    for key, val in updates.items():
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting:
            setting.value = val
        else:
            db.add(SystemSetting(key=key, value=val, description=f"Threshold configuration for {key}"))

    db.commit()

    AuditService.log_action(
        db=db,
        action="SETTINGS_UPDATED",
        target_entity="SystemSetting",
        entity_id="THRESHOLDS",
        user=current_user,
        change_details=f"Updated 3-way matching thresholds: {updates}"
    )

    return {"status": "success", "message": "Matching thresholds updated successfully."}
