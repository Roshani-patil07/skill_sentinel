from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import verify_password, create_access_token, get_current_user_payload
from backend.app.models.entities import User, Role
from backend.app.schemas.schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Use admin@skillsentinel.gov.in / password123"
        )
    
    token_payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role_id,
        "full_name": user.full_name,
        "state_id": user.state_id,
        "district_id": user.district_id,
        "centre_id": user.centre_id
    }
    access_token = create_access_token(token_payload)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": token_payload
    }

@router.get("/me")
def get_current_user(payload: dict = Depends(get_current_user_payload)):
    return payload

@router.get("/demo-users")
def get_demo_users(db: Session = Depends(get_db)):
    """Convenience endpoint for frontend role switcher to easily log in as any role."""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role_id,
            "state_id": u.state_id,
            "district_id": u.district_id,
            "centre_id": u.centre_id
        } for u in users
    ]
