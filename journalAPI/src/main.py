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
    schedule,
    user,
)

app = FastAPI(
    title="Top Academy API",
    description="прослойка msapi.top-academy.ru ",
    version="0.0.2",
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
app.include_router(progress.router)
app.include_router(schedule.router)


@app.get("/health")
def health():
    return {"status": "ok"}