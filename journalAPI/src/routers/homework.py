import asyncio
import time

from app.security import get_current_user
from fastapi import APIRouter, Depends, Query
from schemas import (
    HomeworkCounters,
    HomeworkDeleteRequest,
    HomeworkEvaluateRequest,
    HomeworkItem,
    HomeworkSubmitRequest,
    UpstreamCounter,
)
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/homework", tags=["homework"])

PAGE_SIZE = 6

_HW_COUNTER_MAP = {
    0: "overdue", 1: "checked", 2: "pending",
    3: "new",     4: "total",   5: "returned",
}

ALL_STATUSES = [0, 1, 2, 3, 5]


def _normalize(raw: dict) -> HomeworkItem:
    homework_stud = raw.get("homework_stud") or {}
    grade_raw = homework_stud.get("mark")
    grade = int(grade_raw) if grade_raw is not None else None
    stud_answer = homework_stud.get("stud_answer") or None

    homework_comment = raw.get("homework_comment") or {}
    comment = homework_comment.get("text_comment") or raw.get("comment") or None

    return HomeworkItem(**{
        "id": raw.get("id"),
        "theme": raw.get("theme"),
        "spec_name": raw.get("name_spec"),
        "teacher": raw.get("fio_teach"),
        "issued_date": raw.get("creation_time"),
        "deadline": raw.get("completion_time"),
        "overdue_date": raw.get("overdue_time"),
        "status": raw.get("status"),
        "grade": grade,
        "has_file": bool(raw.get("file_path")),
        "file_url": raw.get("file_path"),
        "comment": comment,
        "stud_answer": stud_answer,
    })


async def _fetch_page(client: UpstreamClient, status: int, group_id: int, page: int) -> list:
    data = await client.get("/homework/operations/list", params={
        "page": page, "status": status, "type": 0, "group_id": group_id,
    })
    return data if isinstance(data, list) else []


@router.get("/counters", response_model=HomeworkCounters)
async def get_counters(
    client: UpstreamClient = Depends(get_upstream_client),
):
    raw = [UpstreamCounter(**e) for e in await client.get("/count/homework")]
    return HomeworkCounters(**{
        _HW_COUNTER_MAP[c.counter_type]: c.counter
        for c in raw if c.counter_type in _HW_COUNTER_MAP
    })


@router.get("/list", response_model=list[HomeworkItem])
async def get_homework(
    status: int = Query(0, description="0=overdue 1=checked 2=pending 3=new 5=returned"),
    group_id: int = Query(..., gt=0),
    page: int = Query(1, ge=1),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    return [_normalize(e) for e in await _fetch_page(client, status, group_id, page)]


@router.post("/refresh")
async def refresh_cache(user: dict = Depends(get_current_user)):
    return {"status": "ok"}


@router.post("/delete")
async def delete_homework(
    body: HomeworkDeleteRequest,
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    return await client.post("/homework/operations/delete", json={"id": body.id})


@router.post("/submit")
async def submit_homework(
    body: HomeworkSubmitRequest,
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    return await client.post("/homework/operations/create", json={
        "id": body.id, "filename": body.filename, "file_path": body.file_path,
        "tmp_file": body.tmp_file, "mark": body.mark, "creation_time": body.creation_time,
        "stud_answer": body.stud_answer, "auto_mark": body.auto_mark,
    })


@router.post("/evaluate")
async def evaluate_homework(
    body: HomeworkEvaluateRequest,
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    return await client.post("/homework/evaluation/operations/save", json={
        "id": body.id, "id_dom_zad": body.id_dom_zad, "id_stud": body.id_stud,
        "mark": body.mark, "comment": body.comment, "tags": body.tags,
    })