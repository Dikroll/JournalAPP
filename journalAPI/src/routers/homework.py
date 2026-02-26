from app.security import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Query
from schemas import HomeworkCounters, HomeworkItem, UpstreamCounter
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/homework", tags=["homework"])

PAGE_SIZE = 6  



async def _fetch_all_pages(client: UpstreamClient, status: int, type: int, group_id: int) -> list:
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
        
        if len(items) < PAGE_SIZE:  
            break
        
        page += 1
    
    return results


@router.get("/list", response_model=list[HomeworkItem])
async def get_homework(
    status: int = Query(0, ge=0, le=3, description="0 pending, 1 checked, 2 overdue, 3 returned"),
    type: int = Query(0, ge=0, le=1, description="0 или 1"),
    group_id: int = Query(..., gt=0, description="ID группы студента"),
    page: int = Query(None, ge=1, description="Конкретная страница (с 1). Если не указана — все страницы"),
    client: UpstreamClient = Depends(get_upstream_client),
):
    if page is not None:
        raw = await client.get("/homework/operations/list", params={
            "page": page, "status": status, "type": type, "group_id": group_id,
        })
        items = raw if isinstance(raw, list) else []
    else:
        items = await _fetch_all_pages(client, status, type, group_id)

    return [HomeworkItem(**_normalize_homework(item)) for item in items]


@router.get("/homework-counters", response_model=HomeworkCounters)
async def get_homework_counters(
    client: UpstreamClient = Depends(get_upstream_client),
):
    _HW_MAP = {
    0: "overdue",     # просрочено
    1: "checked",     # проверены
    2: "pending",     # на проверке 
    3: "new",         # новые
    4: "total",       # всего
    5: "returned",    # вернули
}
    raw = [UpstreamCounter(**e) for e in await client.get("/count/homework")]
    return HomeworkCounters(**{_HW_MAP[c.counter_type]: c.counter for c in raw if c.counter_type in _HW_MAP})


def _normalize_homework(raw: dict) -> dict:
    return {
        "id": raw.get("id"),
        "theme": raw.get("theme"),
        "spec_name": raw.get("name_spec"),
        "teacher": raw.get("fio_teach"),
        "issued_date": raw.get("creation_time"),
        "deadline": raw.get("completion_time"),
        "overdue_date": raw.get("overdue_time"),
        "status": raw.get("status"),
        "has_file": bool(raw.get("file_path")),
        "file_url": raw.get("file_path"),   
        "comment": raw.get("comment") or None,
    }