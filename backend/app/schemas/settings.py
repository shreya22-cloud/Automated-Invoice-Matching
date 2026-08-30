from pydantic import BaseModel
from typing import Optional

class SystemSettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SystemSettingResponse(SystemSettingBase):
    id: int

    class Config:
        from_attributes = True

class SystemThresholdsUpdate(BaseModel):
    amount_tolerance_pct: float = 0.5
    quantity_tolerance_units: float = 1.0
    fuzzy_similarity_threshold_pct: float = 80.0
