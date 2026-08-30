from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.sample_data_generator import SampleDataGenerator

router = APIRouter(prefix="/seed", tags=["Seed Data"])

@router.post("")
def seed_demo_data(db: Session = Depends(get_db)):
    result = SampleDataGenerator.seed_all_demo_data(db)
    return result
