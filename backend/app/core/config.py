import os
import sys
from typing import List
from pydantic import BaseModel

# Ensure ai-engine directory and local backend directory are in sys.path
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
ai_engine_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ai-engine"))
for p in [ai_engine_path, backend_root]:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

class Settings(BaseModel):
    APP_NAME: str = "SKILL-SENTINEL"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "skill_sentinel_super_secret_jwt_key_sih2026_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skill_sentinel.db")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # AI Engine & Stream
    AI_MODE: str = os.getenv("AI_MODE", "simulation") # 'simulation' | 'inference'
    CAMERA_FALLBACK_SIMULATION: bool = os.getenv("CAMERA_FALLBACK_SIMULATION", "true").lower() == "true"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000,http://localhost:8001,http://127.0.0.1:8001"
        ).split(",")
        if origin.strip()
    ]
    
    # WhatsApp Gateway
    WHATSAPP_ENABLED: bool = os.getenv("WHATSAPP_ENABLED", "true").lower() == "true"
    WHATSAPP_PROVIDER: str = os.getenv("WHATSAPP_PROVIDER", "MOCK_GATEWAY")

settings = Settings()

