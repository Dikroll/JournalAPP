import asyncio

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


def _adapt_counts(raw: list, filter_type: int) -> list[LibraryTypeCount]:
    return [
        LibraryTypeCount(
            type_id=e.material_type_id,
            type_name=MATERIAL_TYPES.get(e.material_type_id, f"Тип {e.material_type_id}"),
            total=e.materials_count,
            new=e.new_count,
            recommended=e.recommended_count,
        )
        for e in [UpstreamLibraryCount(**i[0] if isinstance(i, list) else i) for i in raw]
    ]


@router.get("/specs", response_model=list[SpecItem])
async def get_specs(
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Все предметы которые изучал студент."""
    raw = [UpstreamSpec(**e) for e in await client.get("/settings/history-specs")]
    return [SpecItem(id=e.id, name=e.name, short_name=e.short_name) for e in raw]


@router.get("/summary", response_model=LibrarySummary)
async def get_library_summary(
    client: UpstreamClient = Depends(get_upstream_client),
):
    """
    Счётчики библиотеки по всем типам материалов за один запрос.
    new  — filter_type=0 (новые/рекомендованные)
    all  — filter_type=1 (все доступные)
    Делает 16 параллельных запросов.
    """
    material_types = list(MATERIAL_TYPES.keys())

    # все 16 запросов параллельно
    tasks_new = [client.get("/count/library", params={"material_type": t, "filter_type": 0}) for t in material_types]
    tasks_all = [client.get("/count/library", params={"material_type": t, "filter_type": 1}) for t in material_types]

    results = await asyncio.gather(*tasks_new, *tasks_all)

    raw_new = results[:len(material_types)]
    raw_all = results[len(material_types):]

    def adapt(raw_list: list) -> list[LibraryTypeCount]:
        result = []
        for raw in raw_list:
            items = raw if isinstance(raw, list) else [raw]
            for item in items:
                e = UpstreamLibraryCount(**item)
                result.append(LibraryTypeCount(
                    type_id=e.material_type_id,
                    type_name=MATERIAL_TYPES.get(e.material_type_id, f"Тип {e.material_type_id}"),
                    total=e.materials_count,
                    new=e.new_count,
                    recommended=e.recommended_count,
                ))
        return result

    return LibrarySummary(new=adapt(raw_new), all=adapt(raw_all))