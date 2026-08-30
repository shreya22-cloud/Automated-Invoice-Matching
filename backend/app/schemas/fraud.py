from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class FraudAlertResponse(BaseModel):
    id: int
    invoice_id: int
    risk_score: float
    risk_level: str
    duplicate_suspicion_score: float
    isolation_forest_anomaly: str
    benford_law_deviation: float
    rules_triggered: Optional[str] = None
    explainable_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BenfordDigitStat(BaseModel):
    digit: int
    expected_pct: float
    actual_pct: float
