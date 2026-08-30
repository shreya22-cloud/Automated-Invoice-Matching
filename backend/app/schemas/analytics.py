from pydantic import BaseModel
from typing import List, Dict, Any

class DashboardSummary(BaseModel):
    total_invoices: int
    approved_invoices: int
    pending_review: int
    rejected_invoices: int
    high_risk_invoices: int
    total_invoice_amount: float
    matching_success_rate: float

class StatusDistribution(BaseModel):
    name: str
    value: int

class RiskDistribution(BaseModel):
    name: str
    count: int

class VendorStat(BaseModel):
    vendor_name: str
    total_amount: float
    invoice_count: int
    risk_level: str

class MonthlyVolume(BaseModel):
    month: str
    total_count: int
    approved_count: int
    flagged_count: int
