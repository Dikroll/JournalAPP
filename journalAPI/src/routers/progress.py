import asyncio
from datetime import date as date_type
from typing import Optional

from app.cache import TTL, cache
from app.security import get_current_user
from fastapi import APIRouter, Depends, Query
from schemas import (
    ExamResult,
    FutureExam,
    LessonMarks,
    UpstreamExamResult,
    UpstreamFutureExam,
    UpstreamVisitRecord,
    VisitRecord,
)
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/progress", tags=["progress"])

_EXAM_TTL = 60 * 60 * 6  # 6 часов


def _adapt_exam(e: UpstreamExamResult) -> ExamResult:
    return ExamResult(
        exam_id=e.exam_id,
        spec=e.spec,
        teacher=e.teacher,
        mark=e.mark,
        mark_type=e.mark_type,
        date=e.date,
        comment=e.comment_teach,
        has_file=bool(e.file_path),
    )


def _adapt_visit(e: UpstreamVisitRecord) -> VisitRecord:
    marks = LessonMarks(
        control=e.control_work_mark,
        homework=e.home_work_mark,
        lab=e.lab_work_mark,
        classwork=e.class_work_mark,
        practical=e.practical_work_mark,
        final=e.final_work_mark,
    )
    return VisitRecord(
        date=e.date_visit,
        lesson_number=e.lesson_number,
        attended=e.status_was == 1,
        spec_id=e.spec_id,
        spec_name=e.spec_name,
        teacher=e.teacher_name,
        theme=e.lesson_theme,
        marks=marks if marks.any_marks() else None,
    )


def _adapt_future_exam(raw: UpstreamFutureExam) -> FutureExam:
    days_left = None
    if raw.date:
        try:
            exam_date = date_type.fromisoformat(raw.date)
            days_left = (exam_date - date_type.today()).days
            if days_left < 0:
                days_left = 0
        except ValueError:
            pass
    return FutureExam(spec=raw.spec, date=raw.date, days_left=days_left)


@router.get("/exams", response_model=list[ExamResult])
async def get_exams(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """Все экзамены студента (сданные и несданные)."""
    raw = await cache.get_or_fetch(
        key=f"progress:exams:{user['username']}",
        ttl=_EXAM_TTL,
        fetch=lambda: client.get("/progress/operations/student-exams"),
    )
    return [_adapt_exam(UpstreamExamResult(**e)) for e in raw]


@router.get("/exams/pending", response_model=list[ExamResult])
async def get_pending_exams(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """Только несданные экзамены (mark == 0)."""
    raw = await cache.get_or_fetch(
        key=f"progress:exams:{user['username']}",
        ttl=_EXAM_TTL,
        fetch=lambda: client.get("/progress/operations/student-exams"),
    )
    return [_adapt_exam(UpstreamExamResult(**e)) for e in raw if e.get("mark", 0) == 0]


@router.get("/visits", response_model=list[VisitRecord])
async def get_visits(
    spec_id: Optional[int] = Query(None, description="Фильтр по предмету (из /library/specs)"),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """История посещений с оценками. ?spec_id=36 — фильтр по предмету."""
    params = {"spec": spec_id} if spec_id else None  

    raw = await cache.get_or_fetch(
        key=f"progress:visits:{user['username']}:s{spec_id or 'all'}",
        ttl=TTL.SCHEDULE,
        fetch=lambda: client.get("/progress/operations/student-visits", params=params),
    )
    return [_adapt_visit(UpstreamVisitRecord(**e)) for e in raw]


@router.get("/future-exams", response_model=list[FutureExam])
async def get_future_exams(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """Предстоящие экзамены."""
    raw = await cache.get_or_fetch(
        key=f"progress:future-exams:{user['username']}",
        ttl=TTL.SCHEDULE,
        fetch=lambda: client.get("/dashboard/info/future-exams"),
    )
    return [_adapt_future_exam(e) for e in [UpstreamFutureExam(**i) for i in raw]]


@router.get("/summary")
async def get_summary(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """Экзамены + предстоящие за один запрос."""
    exams_raw, future_raw = await asyncio.gather(
        cache.get_or_fetch(f"progress:exams:{user['username']}", _EXAM_TTL,
                           lambda: client.get("/progress/operations/student-exams")),
        cache.get_or_fetch(f"progress:future-exams:{user['username']}", TTL.SCHEDULE,
                           lambda: client.get("/dashboard/info/future-exams")),
    )
    exams = [_adapt_exam(UpstreamExamResult(**e)) for e in exams_raw]
    future = [_adapt_future_exam(e) for e in [UpstreamFutureExam(**i) for i in future_raw]]
    passed = [e for e in exams if e.mark > 0]
    pending = [e for e in exams if e.mark == 0]
    return {
        "future": future,          # предстоящие (дата не назначена)
        "pending": pending,        # назначены но не сданы
        "passed": passed,          # сданы
        "stats": {
            "avg_mark": round(sum(e.mark for e in passed) / len(passed), 2) if passed else None,
            "total": len(exams),
            "passed_count": len(passed),
            "pending_count": len(pending),
        }
    }