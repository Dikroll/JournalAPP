from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    auth,
    dashboard,
    homework,
    news,
    payment,
    progress,
    reviews,
    user,
)

app = FastAPI(
    title="Top Academy API",
    description="Неофициальная прослойка над msapi.top-academy.ru с нормальным API",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # в проде заменить на конкретный origin
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
app.include_router(progress.router)


@app.get("/health")
def health():
    return {"status": "ok"}