"""
Library router.

  GET /library/specs              — история предметов студента
  GET /library/counters           — счётчики всех типов (?spec_id=39)
  GET /library/materials          — материалы по типу (?spec_id=39 &recommended_type=0)
  GET /library/materials/all      — все типы параллельно  (?spec_id=39 &recommended_type=0)
"""
import asyncio
from typing import Optional

from app.cache import TTL, cache
from app.security import get_current_user
from fastapi import APIRouter, Depends, Query
from schemas import (
    LibraryCounterItem,
    LibraryCounters,
    LibraryMaterialItem,
    SpecItem,
    UpstreamLibraryCounter,
    UpstreamSpec,
)
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/library", tags=["library"])

MATERIAL_TYPES: dict[int, str] = {
    1: "lessons",
    2: "library",
    3: "videos",
    4: "articles",
    5: "practical",
    6: "other",
    7: "tests",
    8: "additional",
}

_COUNTER_FIELD: dict[int, str] = {
    1: "lessons",
    2: "books",
    3: "videos",
    4: "articles",
    5: "practical",
    6: "other",
    7: "tests",
    8: "additional",
}


# ══════════════════════════════════════════════════════════════════
#  ПРЕДМЕТЫ
# ══════════════════════════════════════════════════════════════════

@router.get("/specs", response_model=list[SpecItem])
async def get_specs(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """Все предметы которые изучал студент."""
    raw = await cache.get_or_fetch(
        key=f"library:specs:{user['username']}",
        ttl=TTL.SPECS,
        fetch=lambda: client.get("/settings/history-specs"),
    )
    return [SpecItem(id=e.id, name=e.name, short_name=e.short_name)
            for e in [UpstreamSpec(**i) for i in raw]]


# ══════════════════════════════════════════════════════════════════
#  СЧЁТЧИКИ — один запрос на все типы
# ══════════════════════════════════════════════════════════════════

@router.get("/counters", response_model=LibraryCounters)
async def get_counters(
    spec_id: Optional[int] = Query(None, description="Фильтр по предмету, например 39"),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """
    Счётчики материалов по всем типам — один запрос к upstream.
    Опционально: ?spec_id=39 — только по конкретному предмету.
    """
    params = {"spec_id": spec_id} if spec_id else {}

    raw = await cache.get_or_fetch(
        key=f"library:counters:{user['username']}:s{spec_id or 'all'}",
        ttl=TTL.LIBRARY,
        fetch=lambda: client.get("/count/library", params=params or None),
    )

    items = raw if isinstance(raw, list) else [raw]
    mapping: dict[str, LibraryCounterItem] = {}
    for item in items:
        e = UpstreamLibraryCounter(**item)
        field = _COUNTER_FIELD.get(e.material_type_id)
        if field:
            mapping[field] = LibraryCounterItem(
                total=e.materials_count,
                new=e.new_count,
                recommended=e.recommended_count,
            )
    return LibraryCounters(**mapping)


# ══════════════════════════════════════════════════════════════════
#  МАТЕРИАЛЫ
# ══════════════════════════════════════════════════════════════════

def _adapt_material(raw: dict) -> LibraryMaterialItem:
    mt = raw.get("material_type", 0)
    return LibraryMaterialItem(
        material_id=raw["material_id"],
        theme=raw.get("theme"),
        description=raw.get("description"),
        material_type=mt,
        type_name=MATERIAL_TYPES.get(mt, "Другое"),
        spec_id=raw.get("id_spec"),
        spec_name=raw.get("name_spec"),
        date=raw.get("date"),
        week=raw.get("current_week"),
        public_week=raw.get("public_week"),
        is_new=raw.get("is_new_material", False),
        link=raw.get("link"),
        download_url=raw.get("download_url"),
        cover_image=raw.get("cover_image"),
    )


@router.get("/materials", response_model=list[LibraryMaterialItem])
async def get_materials(
    material_type: int = Query(
        ...,
        description="Тип: 1=Уроки 2=Библиотека 3=Видео 4=Статьи 5=Практика 6=Другое 7=Тесты 8=Доп",
    ),
    recommended_type: int = Query(0, description="0=все, 1=только новые/рекомендованные"),
    spec_id: Optional[int] = Query(None, description="Фильтр по предмету"),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """Материалы одного типа. Опционально: ?spec_id=39"""
    params: dict = {"material_type": material_type, "recommended_type": recommended_type}
    if spec_id:
        params["spec_id"] = spec_id

    raw = await cache.get_or_fetch(
        key=f"library:mat:{user['username']}:t{material_type}:r{recommended_type}:s{spec_id or 'all'}",
        ttl=TTL.LIBRARY,
        fetch=lambda: client.get("/library/operations/list", params=params),
    )
    return [_adapt_material(e) for e in (raw if isinstance(raw, list) else [])]


@router.get("/materials/all")
async def get_all_materials(
    recommended_type: int = Query(0, description="0=все, 1=только новые"),
    spec_id: Optional[int] = Query(None, description="Фильтр по предмету"),
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """
    Все типы материалов параллельно — 8 запросов за один вызов.
    Возвращает: { "Библиотека": [...], "Видео": [...], ... }
    Пустые типы не включаются.
    """
    async def fetch_type(t: int) -> tuple[str, list[LibraryMaterialItem]]:
        params: dict = {"material_type": t, "recommended_type": recommended_type}
        if spec_id:
            params["spec_id"] = spec_id

        raw = await cache.get_or_fetch(
            key=f"library:mat:{user['username']}:t{t}:r{recommended_type}:s{spec_id or 'all'}",
            ttl=TTL.LIBRARY,
            fetch=lambda t=t: client.get("/library/operations/list", params={
                "material_type": t,
                "recommended_type": recommended_type,
                **({"spec_id": spec_id} if spec_id else {}),
            }),
        )
        items = [_adapt_material(e) for e in (raw if isinstance(raw, list) else [])]
        return MATERIAL_TYPES[t], items

    results = await asyncio.gather(*[fetch_type(t) for t in MATERIAL_TYPES])
    return {name: items for name, items in results if items}