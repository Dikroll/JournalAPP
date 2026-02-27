from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    auth,
    dashboard,
    feedback,
    homework,
    library,
    market,
    news,
    payment,
    reviews,
    schedule,
    user,
)
from services.upstream_client import get_http_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # при старте — инициализируем connection pool
    get_http_client()
    yield
    # при остановке — закрываем все соединения
    from services.upstream_client import _http
    if _http and not _http.is_closed:
        await _http.aclose()


app = FastAPI(
    title="Top Academy API",
    description="Неофициальная прослойка над msapi.top-academy.ru с нормальным API",
    version="0.2.0",
    lifespan=lifespan,
    swagger_ui_parameters={"persistAuthorization": True},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(dashboard.router)
app.include_router(homework.router)
app.include_router(reviews.router)
app.include_router(news.router)
app.include_router(payment.router)
app.include_router(schedule.router)
app.include_router(feedback.router)
app.include_router(market.router)
app.include_router(library.router)


@app.get("/health")
def health():
    return {"status": "ok"}