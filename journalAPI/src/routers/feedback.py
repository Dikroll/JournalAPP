from app.cache import TTL, cache
from app.security import get_current_user
from fastapi import APIRouter, Depends
from schemas import (
    EvaluateRequest,
    PendingLesson,
    Tag,
    UpstreamPendingLesson,
    UpstreamTag,
)
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/feedback", tags=["feedback"])

_TAGS_TTL = 60 * 60 * 24 * 7  # 7 дней — теги статичны


@router.get("/pending", response_model=list[PendingLesson])
async def get_pending_lessons(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """Уроки ожидающие оценки."""
    raw = await cache.get_or_fetch(
        key=f"feedback:pending:{user['username']}",
        ttl=TTL.FEEDBACK,
        fetch=lambda: client.get("/feedback/students/evaluate-lesson-list"),
    )
    return [
        PendingLesson(key=e.key, date=e.date_visit, teacher=e.fio_teach,
                      subject=e.spec_name, teacher_photo=e.teach_photo)
        for e in [UpstreamPendingLesson(**i) for i in raw]
    ]


@router.get("/tags", response_model=list[Tag])
async def get_tags(
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Теги для оценки — общие для всех, кэш 7 дней."""
    raw = await cache.get_or_fetch(
        key="feedback:tags:global",
        ttl=_TAGS_TTL,
        fetch=lambda: client.get("/public/tags", params={"type": "evaluation_lesson"}),
    )
    return [Tag(id=e.id, key=e.translate_key) for e in [UpstreamTag(**i) for i in raw]]


@router.post("/evaluate")
async def evaluate_lesson(
    body: EvaluateRequest,
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """Отправить оценку — после успеха сбрасываем кэш pending."""
    result = await client.post("/feedback/students/evaluate-lesson", json={
        "key": body.key,
        "mark_lesson": body.mark_lesson,
        "mark_teach": body.mark_teach,
        "tags_lesson": body.tags_lesson,
        "tags_teach": body.tags_teach,
        "comment_lesson": body.comment_lesson,
        "comment_teach": body.comment_teach,
    })
    cache.invalidate_key(f"feedback:pending:{user['username']}")
    return result