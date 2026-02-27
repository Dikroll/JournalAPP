import asyncio
import time

from app.security import get_current_user
from fastapi import APIRouter, Depends, Query
from schemas import HomeworkCounters, HomeworkItem, UpstreamCounter
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/homework", tags=["homework"])

PAGE_SIZE = 6

# ══════════════════════════════════════════════════════════════════
#  СТАТУСЫ upstream:
#  0 — просроченные (overdue)
#  1 — проверенные  (checked)
#  2 — на проверке  (pending)
#  3 — новые/не сделанные (new)
#  5 — возвращённые (returned)
#
#  СЧЁТЧИКИ upstream (counter_type):
#  0=overdue  1=checked  2=pending  3=new  4=total  5=returned
# ══════════════════════════════════════════════════════════════════

_HW_COUNTER_MAP = {
    0: "overdue",
    1: "checked",
    2: "pending",
    3: "new",       
    4: "total",
    5: "returned",
}

ALL_STATUSES = [0, 1, 2, 3, 5]

# кэш для всех ДЗ по статусу: ключ — (username, status, group_id), значение — {"data": [...], "expires_at": timestamp}
_cache: dict[tuple, dict] = {}
CACHE_TTL = 60 * 30


def _cache_get(key: tuple) -> list | None:
    entry = _cache.get(key)
    if entry and time.time() < entry["expires_at"]:
        return entry["data"]
    return None


def _cache_set(key: tuple, data: list) -> None:
    _cache[key] = {"data": data, "expires_at": time.time() + CACHE_TTL}


def _cache_invalidate(username: str) -> None:
    keys = [k for k in _cache if k[0] == username]
    for k in keys:
        del _cache[k]


# нормализация 
def _normalize(raw: dict) -> HomeworkItem:
    return HomeworkItem(**{
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
    })


async def _fetch_page(client: UpstreamClient, status: int, group_id: int, page: int) -> list:
    data = await client.get("/homework/operations/list", params={
        "page": page, "status": status, "type": 0, "group_id": group_id,
    })
    return data if isinstance(data, list) else []


async def _fetch_all(client: UpstreamClient, status: int, group_id: int, username: str) -> list[HomeworkItem]:
    """Все страницы параллельно пачками по 5. С кэшем."""
    cache_key = (username, status, group_id)
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    first = await _fetch_page(client, status, group_id, 1)
    if not first or len(first) < PAGE_SIZE:
        result = [_normalize(e) for e in first]
        _cache_set(cache_key, result)
        return result

    all_items = list(first)
    page = 2
    while True:
        batch = await asyncio.gather(*[
            _fetch_page(client, status, group_id, p)
            for p in range(page, page + 5)
        ])
        done = False
        for items in batch:
            all_items.extend(items)
            if len(items) < PAGE_SIZE:
                done = True
                break
        if done:
            break
        page += 5

    result = [_normalize(e) for e in all_items]
    _cache_set(cache_key, result)
    return result



@router.get("/counters", response_model=HomeworkCounters)
async def get_counters(
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Счётчики ДЗ по статусам."""
    raw = [UpstreamCounter(**e) for e in await client.get("/count/homework")]
    return HomeworkCounters(**{_HW_COUNTER_MAP[c.counter_type]: c.counter for c in raw if c.counter_type in _HW_COUNTER_MAP})

@router.get("/overdue", response_model=list[HomeworkItem])
async def get_overdue(
    group_id: int = Query(..., gt=0),
    page: int = Query(1, ge=1),
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Просроченные ДЗ — одна страница."""
    return [_normalize(e) for e in await _fetch_page(client, 0, group_id, page)]


@router.get("/checked", response_model=list[HomeworkItem])
async def get_checked(
    group_id: int = Query(..., gt=0),
    page: int = Query(1, ge=1),
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Проверенные ДЗ — одна страница."""
    return [_normalize(e) for e in await _fetch_page(client, 1, group_id, page)]


@router.get("/pending", response_model=list[HomeworkItem])
async def get_pending(
    group_id: int = Query(..., gt=0),
    page: int = Query(1, ge=1),
    client: UpstreamClient = Depends(get_upstream_client),
):
    """На проверке — одна страница."""
    return [_normalize(e) for e in await _fetch_page(client, 2, group_id, page)]


@router.get("/new", response_model=list[HomeworkItem])
async def get_new(
    group_id: int = Query(..., gt=0),
    page: int = Query(1, ge=1),
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Новые/не сделанные ДЗ — одна страница."""
    return [_normalize(e) for e in await _fetch_page(client, 3, group_id, page)]


@router.get("/returned", response_model=list[HomeworkItem])
async def get_returned(
    group_id: int = Query(..., gt=0),
    page: int = Query(1, ge=1),
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Возвращённые ДЗ — одна страница."""
    return [_normalize(e) for e in await _fetch_page(client, 5, group_id, page)]

@router.get("/overdue/all", response_model=list[HomeworkItem])
async def get_all_overdue(
    group_id: int = Query(..., gt=0),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    return await _fetch_all(client, 0, group_id, user["username"])


@router.get("/checked/all", response_model=list[HomeworkItem])
async def get_all_checked(
    group_id: int = Query(..., gt=0),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    return await _fetch_all(client, 1, group_id, user["username"])


@router.get("/pending/all", response_model=list[HomeworkItem])
async def get_all_pending(
    group_id: int = Query(..., gt=0),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    return await _fetch_all(client, 2, group_id, user["username"])


@router.get("/new/all", response_model=list[HomeworkItem])
async def get_all_new(
    group_id: int = Query(..., gt=0),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    return await _fetch_all(client, 3, group_id, user["username"])


@router.get("/returned/all", response_model=list[HomeworkItem])
async def get_all_returned(
    group_id: int = Query(..., gt=0),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    return await _fetch_all(client, 5, group_id, user["username"])


class AllHomework:
    overdue: list[HomeworkItem]
    checked: list[HomeworkItem]
    pending: list[HomeworkItem]
    new: list[HomeworkItem]
    returned: list[HomeworkItem]


@router.get("/sync")
async def sync_all(
    group_id: int = Query(..., gt=0),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """
    Загружает ВСЕ ДЗ всех статусов параллельно.
    Один запрос — все дз.
    """
    _cache_invalidate(user["username"])  # сбрасываем старый кэш

    overdue, checked, pending, new, returned = await asyncio.gather(
        _fetch_all(client, 0, group_id, user["username"]),
        _fetch_all(client, 1, group_id, user["username"]),
        _fetch_all(client, 2, group_id, user["username"]),
        _fetch_all(client, 3, group_id, user["username"]),
        _fetch_all(client, 5, group_id, user["username"]),
    )

    return {
        "overdue":  overdue,
        "checked":  checked,
        "pending":  pending,
        "new":      new,
        "returned": returned,
        "total":    len(overdue) + len(checked) + len(pending) + len(new) + len(returned),
    }

@router.post("/refresh")
async def refresh_cache(
    user: dict = Depends(get_current_user),
):
    """Сбросить кэш ДЗ вручную."""
    _cache_invalidate(user["username"])
    return {"status": "cache cleared"}


@router.get("/list", response_model=list[HomeworkItem])
async def get_homework(
    status: int = Query(0, description="0 overdue, 1 checked, 2 pending, 3 new, 5 returned"),
    group_id: int = Query(..., gt=0),
    page: int = Query(None, ge=1, description="Страница. Без параметра — все с кэшем"),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    if page is not None:
        return [_normalize(e) for e in await _fetch_page(client, status, group_id, page)]
    return await _fetch_all(client, status, group_id, user["username"])