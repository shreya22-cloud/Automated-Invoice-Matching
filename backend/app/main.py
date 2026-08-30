from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import os
from pathlib import Path

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import *  # Import all models for table creation
from app.services.sample_data_generator import SampleDataGenerator

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FraudLens AI - Intelligent Invoice Matching & Multi-Layer Fraud Detection Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory statically for document previewing
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
from app.api import (
    auth,
    invoices,
    purchase_orders,
    grn,
    fraud,
    analytics,
    vendors,
    audit,
    settings as settings_api,
    seed
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(invoices.router, prefix=settings.API_V1_STR)
app.include_router(purchase_orders.router, prefix=settings.API_V1_STR)
app.include_router(grn.router, prefix=settings.API_V1_STR)
app.include_router(fraud.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(vendors.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(settings_api.router, prefix=settings.API_V1_STR)
app.include_router(seed.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        SampleDataGenerator.ensure_seeded_demo_data(db)
    except Exception as e:
        print(f"[Startup Warning] Demo data check note: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[Global Error] {request.method} {request.url} failed: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please refer to system logs."}
    )

# The production Docker image includes the Vite build alongside this API.  This
# fallback keeps React routes (for example /invoices) working when opened
# directly, while development continues to use Vite's own development server.
frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"

if frontend_dist.is_dir():
    @app.get("/{path:path}", include_in_schema=False)
    async def serve_frontend(path: str):
        requested_file = (frontend_dist / path).resolve()
        if requested_file.is_relative_to(frontend_dist) and requested_file.is_file():
            return FileResponse(requested_file)
        return FileResponse(frontend_dist / "index.html")
