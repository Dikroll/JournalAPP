from collections import defaultdict

from app.logger import setup_logger
from app.security import get_current_user
from fastapi import APIRouter, Depends
from schemas import ReviewGroup, UpstreamReview
from services.upstream_client import UpstreamClient, get_upstream_client

log = setup_logger("reviews")
router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/list", response_model=list[ReviewGroup])
async def get_reviews(
    client: UpstreamClient = Depends(get_upstream_client),
):
    raw = [UpstreamReview(**e) for e in await client.get("/reviews/index/list")]
    log.debug(f"Got {len(raw)} raw review entries from upstream")

    # группируем по teacher + message (дату игнорируем — upstream ставит разный timestamp
    # для одного и того же отзыва по нескольким предметам)
    groups: dict[tuple, dict] = defaultdict(lambda: {"date": None, "specs": []})
    for e in raw:
        key = (e.teacher, e.message)
        groups[key]["date"] = groups[key]["date"] or e.date  # берём первую дату
        groups[key]["specs"].append(e.full_spec)

    result = [
        ReviewGroup(teacher=teacher, message=message, date=g["date"], specs=g["specs"])
        for (teacher, message), g in groups.items()
    ]
    log.info(f"Reviews: {len(raw)} upstream entries → {len(result)} grouped")
    return result