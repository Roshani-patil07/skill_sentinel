import os
import sys
sys.path.insert(0, os.path.abspath("."))

from backend.app.core.security import hash_password, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    raw_pwd = "GovOfficer@2026"
    hashed = hash_password(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_flow():
    payload = {
        "sub": "user-123",
        "email": "officer@skillsentinel.gov.in",
        "role": "INSPECTION_OFFICER"
    }
    token = create_access_token(payload)
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user-123"
    assert decoded["email"] == "officer@skillsentinel.gov.in"
    assert decoded["role"] == "INSPECTION_OFFICER"
