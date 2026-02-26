from app.security import create_access_token
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from schemas import TokenResponse
from services.upstream_client import UpstreamClient

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends()):
    """
    Swagger подтягивает логин/пароль автоматически через форму.
    """
    client = UpstreamClient(form.username, form.password)
    await client._login()

    our_token = create_access_token({
        "username": form.username,
        "password": form.password,
    })

    return TokenResponse(access_token=our_token)