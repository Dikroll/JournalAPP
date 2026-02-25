from fastapi import APIRouter, Depends, Query

from app.security import get_current_user
from schemas import HomeworkCounters, HomeworkItem
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/homework", tags=["homework"])


async def _fetch_all_pages(client: UpstreamClient, status: int, type: int, group_id: int) -> list:
    """Итерирует страницы до пустого ответа."""
    results = []
    page = 1
    while True:
        data = await client.get("/homework/operations/list", params={
            "page": page,
            "status": status,
            "type": type,
            "group_id": group_id,
        })
        items = data if isinstance(data, list) else []
        if not items:
            break
        results.extend(items)
        page += 1
    return results


@router.get("/list", response_model=list[HomeworkItem])
async def get_homework(
    status: int = Query(0, description="0 pending, 1 checked, 2 overdue, 3 returned"),
    type: int = Query(0),
    group_id: int = Query(..., description="ID группы студента"),
    page: int = Query(None, description="Конкретная страница. Если не указана — все страницы"),
    user: dict = Depends(get_current_user),
    client: UpstreamClient = Depends(get_upstream_client),
):
    """
    Список домашних заданий.
    Без page — собирает все страницы автоматически.
    С page — возвращает только указанную страницу.
    """
    if page is not None:
        raw = await client.get("/homework/operations/list", params={
            "page": page, "status": status, "type": type, "group_id": group_id,
        })
        items = raw if isinstance(raw, list) else []
    else:
        items = await _fetch_all_pages(client, status, type, group_id)

    # структура ответа upstream пока не полностью известна — возвращаем as-is через модель
    return [HomeworkItem(**_normalize_homework(item)) for item in items]


def _normalize_homework(raw: dict) -> dict:
    """Нормализует поля — дополнить когда узнаем полную структуру upstream."""
    return {
        "id": raw.get("id") or raw.get("homework_id"),
        "theme": raw.get("theme") or raw.get("name"),
        "spec_name": raw.get("spec_name") or raw.get("subject"),
        "teacher": raw.get("teacher") or raw.get("teacher_name"),
        "issued_date": raw.get("issued_date") or raw.get("date"),
        "deadline": raw.get("deadline") or raw.get("date_deadline"),
        "status": raw.get("status"),
    }