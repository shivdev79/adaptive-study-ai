import hmac
import hashlib
import json
import base64
import time
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)

# Password hashing with sha256 + salt fallback if passlib is missing
def get_password_hash(password: str) -> str:
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)
    except Exception:
        salt = "studymind_secure_salt_2026"
        return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
            return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        pass
    salt = "studymind_secure_salt_2026"
    expected = hashlib.sha256((plain_password + salt).encode('utf-8')).hexdigest()
    return hmac.compare_digest(expected, hashed_password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = int((datetime.utcnow() + expires_delta).timestamp())
    else:
        expire = int((datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp())
    
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {"sub": str(subject), "exp": expire}

    header_encoded = base64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_encoded = base64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))

    signing_input = f"{header_encoded}.{payload_encoded}".encode('utf-8')
    signature = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_encoded = base64url_encode(signature)

    return f"{header_encoded}.{payload_encoded}.{signature_encoded}"

def decode_token(token: str) -> dict:
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid token format")

    header_encoded, payload_encoded, signature_encoded = parts
    signing_input = f"{header_encoded}.{payload_encoded}".encode('utf-8')
    expected_sig = hmac.new(settings.SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()

    if not hmac.compare_digest(base64url_encode(expected_sig), signature_encoded):
        raise ValueError("Invalid signature")

    payload_bytes = base64url_decode(payload_encoded)
    payload = json.loads(payload_bytes.decode('utf-8'))

    if payload.get("exp") and time.time() > payload["exp"]:
        raise ValueError("Token expired")

    return payload

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from app.models.user import User  # Deferred import to prevent circular dependency
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user
