from app.security import create_access_token
from fastapi import APIRouter, HTTPException
from schemas import LoginRequest, TokenResponse
from services.upstream_client import UpstreamClient

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    """
    """
    client = UpstreamClient(body.username, body.password)
    await client._login()  

    our_token = create_access_token({
        "username": body.username,
        "password": body.password,  
    })

    return TokenResponse(access_token=our_token)