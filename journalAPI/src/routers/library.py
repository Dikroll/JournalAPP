import asyncio

from app.cache import TTL, cache
from app.security import get_current_user
from fastapi import APIRouter, Depends
from schemas import (
    LibrarySummary,
    LibraryTypeCount,
    SpecItem,
    UpstreamLibraryCount,
    UpstreamSpec,
)
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/library", tags=["library"])

MATERIAL_TYPES = {
    1: "Уроки",
    2: "Библиотека",
    3: "Видео",
    4: "Статьи",
    5: "Практические задания",
    6: "Другое",
    7: "Тесты",
    8: "Дополнительно",
}


def _adapt_count(item: dict) -> LibraryTypeCount:
    e = UpstreamLibraryCount(**item)
    return LibraryTypeCount(
        type_id=e.material_type_id,
        type_name=MATERIAL_TYPES.get(e.material_type_id, f"Тип {e.material_type_id}"),
        total=e.materials_count,
        new=e.new_count,
        recommended=e.recommended_count,
    )


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


@router.get("/summary", response_model=LibrarySummary)
async def get_library_summary(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    """16 запросов параллельно, каждый кэшируется отдельно."""
    material_types = list(MATERIAL_TYPES.keys())

    results = await asyncio.gather(*[
        cache.get_or_fetch(
            key=f"library:count:{user['username']}:t{t}:f{f}",
            ttl=TTL.LIBRARY,
            fetch=lambda t=t, f=f: client.get("/count/library", params={"material_type": t, "filter_type": f}),
        )
        for t in material_types for f in (0, 1)
    ])

    # results порядок: [t1f0, t1f1, t2f0, t2f1, ...]
    new_counts, all_counts = [], []
    for i, raw in enumerate(results):
        items = raw if isinstance(raw, list) else [raw]
        adapted = [_adapt_count(item) for item in items]
        if i % 2 == 0:
            new_counts.extend(adapted)   # filter_type=0
        else:
            all_counts.extend(adapted)   # filter_type=1

    return LibrarySummary(new=new_counts, all=all_counts)