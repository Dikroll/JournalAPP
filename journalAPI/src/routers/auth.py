from app.security import create_access_token
from fastapi import APIRouter, HTTPException
from schemas import LoginRequest, TokenResponse
from services.upstream_client import UpstreamClient

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    """
    Логинимся в upstream, проверяем что credentials рабочие,
    и выдаём НАШИ долгоживущие токены (30 дней).
    Клиенту не нужно больше перелогиниваться.
    """
    client = UpstreamClient(body.username, body.password)
    await client._login()  # проверяем что credentials рабочие

    # credentials кладём в payload нашего токена (они нужны для авто-переlogина)
    our_token = create_access_token({
        "username": body.username,
        "password": body.password,  # зашифровано внутри JWT
    })

    return TokenResponse(access_token=our_token)