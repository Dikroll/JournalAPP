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


@router.get("/pending", response_model=list[PendingLesson])
async def get_pending_lessons(
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Уроки ожидающие оценки."""
    raw = [UpstreamPendingLesson(**e) for e in await client.get("/feedback/students/evaluate-lesson-list")]
    return [
        PendingLesson(
            key=e.key,
            date=e.date_visit,
            teacher=e.fio_teach,
            subject=e.spec_name,
            teacher_photo=e.teach_photo,
        )
        for e in raw
    ]


@router.get("/tags", response_model=list[Tag])
async def get_tags(
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Теги для оценки урока."""
    raw = [UpstreamTag(**e) for e in await client.get("/public/tags", params={"type": "evaluation_lesson"})]
    return [Tag(id=e.id, key=e.translate_key) for e in raw]


@router.post("/evaluate")
async def evaluate_lesson(
    body: EvaluateRequest,
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Отправить оценку урока."""
    return await client.post("/feedback/students/evaluate-lesson", json={
        "key": body.key,
        "mark_lesson": body.mark_lesson,
        "mark_teach": body.mark_teach,
        "tags_lesson": body.tags_lesson,
        "tags_teach": body.tags_teach,
        "comment_lesson": body.comment_lesson,
        "comment_teach": body.comment_teach,
    })