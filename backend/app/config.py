import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "FraudLens AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fraudlens_super_secret_jwt_key_change_in_production_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fraudlens.db")
    
    # Upload Settings
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
    
    # Matching Threshold Defaults
    DEFAULT_AMOUNT_TOLERANCE_PCT: float = 0.5   # 0.5%
    DEFAULT_QUANTITY_TOLERANCE: float = 1.0     # 1 unit
    DEFAULT_FUZZY_THRESHOLD_PCT: float = 80.0   # 80%

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
