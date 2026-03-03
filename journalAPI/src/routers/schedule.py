from datetime import date

from app.cache import TTL, cache
from app.security import get_current_user
from fastapi import APIRouter, Depends, Query
from schemas import LessonItem, UpstreamLesson
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/schedule", tags=["schedule"])


def _adapt(raw: UpstreamLesson) -> LessonItem:
    return LessonItem(
        date=raw.date, lesson=raw.lesson,
        started_at=raw.started_at, finished_at=raw.finished_at,
        teacher=raw.teacher_name, subject=raw.subject_name, room=raw.room_name,
    )


@router.get("/today", response_model=list[LessonItem])
async def get_today(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    today = date.today().isoformat()
    raw = await cache.get_or_fetch(
        key=f"schedule:day:{user['username']}:{today}",
        ttl=TTL.SCHEDULE,
        fetch=lambda: client.get("/schedule/operations/get-by-date", params={"date_filter": today}),
    )
    return [_adapt(UpstreamLesson(**e)) for e in raw]


@router.get("/by-date", response_model=list[LessonItem])
async def get_by_date(
    date_filter: str = Query(..., description="YYYY-MM-DD"),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    raw = await cache.get_or_fetch(
        key=f"schedule:day:{user['username']}:{date_filter}",
        ttl=TTL.SCHEDULE,
        fetch=lambda: client.get("/schedule/operations/get-by-date", params={"date_filter": date_filter}),
    )
    return [_adapt(UpstreamLesson(**e)) for e in raw]


@router.get("/month", response_model=list[LessonItem])
async def get_month(
    date_filter: str = Query(..., description="Любая дата месяца YYYY-MM-DD"),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    month = date_filter[:7]  
    raw = await cache.get_or_fetch(
        key=f"schedule:month:{user['username']}:{month}",
        ttl=TTL.SCHEDULE,
        fetch=lambda: client.get("/schedule/operations/get-month", params={"date_filter": date_filter}),
    )
    return [_adapt(UpstreamLesson(**e)) for e in raw]

@router.get("/week", response_model=list[LessonItem])
async def get_week(
    date_filter: str = Query(..., description="Любая дата недели YYYY-MM-DD"),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """Расписание на неделю. Передай любую дату — API сам найдёт пн–вс."""
    from datetime import date, timedelta
    d = date.fromisoformat(date_filter)
    monday = d - timedelta(days=d.weekday())
    sunday = monday + timedelta(days=6)

    raw = await cache.get_or_fetch(
        key=f"schedule:week:{user['username']}:{monday.isoformat()}",
        ttl=TTL.SCHEDULE,
        fetch=lambda: client.get("/schedule/operations/get-by-date-range", params={
            "date_start": monday.isoformat(),
            "date_end": sunday.isoformat(),
        }),
    )
    return [_adapt(UpstreamLesson(**e)) for e in raw]