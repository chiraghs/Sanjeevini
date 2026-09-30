import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.scripts.seed_health_data import seed_database
from app.api.v1 import (
    facilities,
    inventory,
    forecasting,
    redistribution,
    multimodal,
    voice,
    federated,
    analytics,
    alerts,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sanjeevani")

# Ensure tables and seed exist at import time
Base.metadata.create_all(bind=engine)
try:
    seed_database()
except Exception as e:
    logger.warning(f"Database bootstrap warning: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Federated AI Platform for National Health Resource & Supply Chain Resilience across India's PHC Network.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers (Primary /api/v1)
app.include_router(facilities.router, prefix=f"{settings.API_V1_STR}/facilities", tags=["Facilities"])
app.include_router(inventory.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["Inventory"])
app.include_router(forecasting.router, prefix=f"{settings.API_V1_STR}/forecasting", tags=["Forecasting"])
app.include_router(redistribution.router, prefix=f"{settings.API_V1_STR}/redistribution", tags=["Redistribution"])
app.include_router(multimodal.router, prefix=f"{settings.API_V1_STR}/multimodal", tags=["Multimodal Vision OCR"])
app.include_router(voice.router, prefix=f"{settings.API_V1_STR}/voice", tags=["Indic Voice Assistant"])
app.include_router(federated.router, prefix=f"{settings.API_V1_STR}/federated", tags=["Federated Learning"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["National Analytics"])
app.include_router(alerts.router, prefix=f"{settings.API_V1_STR}/alerts", tags=["Health Alerts"])

# Dual-mount without /api/v1 for clients configured with root base URL
app.include_router(facilities.router, prefix="/facilities", include_in_schema=False)
app.include_router(inventory.router, prefix="/inventory", include_in_schema=False)
app.include_router(forecasting.router, prefix="/forecasting", include_in_schema=False)
app.include_router(redistribution.router, prefix="/redistribution", include_in_schema=False)
app.include_router(multimodal.router, prefix="/multimodal", include_in_schema=False)
app.include_router(voice.router, prefix="/voice", include_in_schema=False)
app.include_router(federated.router, prefix="/federated", include_in_schema=False)
app.include_router(analytics.router, prefix="/analytics", include_in_schema=False)
app.include_router(alerts.router, prefix="/alerts", include_in_schema=False)

# Prometheus Metrics
Instrumentator().instrument(app).expose(app)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "gemini_model": settings.GEMINI_MODEL
    }

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "message": "Welcome to SanjeevaniSetu - National Health Resource & Supply Chain Resilience Platform",
        "docs_url": "/docs",
        "health_url": "/health",
        "version": "1.0.0"
    }
