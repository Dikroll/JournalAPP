import base64
import hashlib
from datetime import datetime, timedelta
from typing import Optional

from cryptography.fernet import Fernet
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def _get_fernet() -> Fernet:
    key = hashlib.sha256(settings.ENCRYPT_KEY.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(key))


def encrypt_password(password: str) -> str:
    return _get_fernet().encrypt(password.encode()).decode()


def decrypt_password(token: str) -> str:
    return _get_fernet().decrypt(token.encode()).decode()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if "password" in to_encode:
        to_encode["password"] = encrypt_password(to_encode["password"])
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        if "password" in payload:
            payload["password"] = decrypt_password(payload["password"])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid or expired",
        )


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    return decode_token(token)