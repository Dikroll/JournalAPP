import asyncio

from app.cache import TTL, cache
from app.security import get_current_user
from fastapi import APIRouter, Depends
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
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """История посещений с оценками."""
    raw = await cache.get_or_fetch(
        key=f"progress:visits:{user['username']}",
        ttl=TTL.SCHEDULE,
        fetch=lambda: client.get("/progress/operations/student-visits"),
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
    return [FutureExam(spec=e.spec, date=e.date) for e in [UpstreamFutureExam(**i) for i in raw]]


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
    future = [FutureExam(spec=e.spec, date=e.date) for e in [UpstreamFutureExam(**i) for i in future_raw]]
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