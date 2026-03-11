import os
from contextlib import asynccontextmanager

from app.logger import setup_logger
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import (
    auth,
    dashboard,
    feedback,
    files,
    homework,
    library,
    market,
    news,
    payment,
    progress,
    reviews,
    schedule,
    user,
)
from services.upstream_client import get_http_client
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

log = setup_logger("main")


limiter = Limiter(key_func=get_remote_address, default_limits=["300/minute"])



@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Starting up...")
    get_http_client()
    yield
    log.info("Shutting down...")
    from services.upstream_client import _http
    if _http and not _http.is_closed:
        await _http.aclose()



_debug = os.getenv("DEBUG", "false").lower() == "true"

app = FastAPI(
    title="Top Academy API",
    description="Неофициальная прослойка над msapi.top-academy.ru с нормальным API",
    version="0.2.0",
    lifespan=lifespan,
    swagger_ui_parameters={"persistAuthorization": True},
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
_origins = [o.strip() for o in _raw_origins.split(",")] if _raw_origins != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.exception(f"Unhandled error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})



app.include_router(auth.router)
app.include_router(user.router)
app.include_router(dashboard.router)
app.include_router(homework.router)
app.include_router(reviews.router)
app.include_router(news.router)
app.include_router(payment.router)
app.include_router(schedule.router)
app.include_router(feedback.router)
app.include_router(progress.router)
app.include_router(market.router)
app.include_router(library.router)
app.include_router(files.router)


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok"}