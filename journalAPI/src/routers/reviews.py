from collections import defaultdict

from app.cache import TTL, cache
from app.logger import setup_logger
from app.security import get_current_user
from fastapi import APIRouter, Depends
from schemas import ReviewGroup, UpstreamReview
from services.upstream_client import UpstreamClient, get_upstream_client

log = setup_logger("reviews")
router = APIRouter(prefix="/reviews", tags=["reviews"])


def _group_reviews(raw_list: list) -> list[ReviewGroup]:
    raw = [UpstreamReview(**e) for e in raw_list]
    log.debug(f"Got {len(raw)} raw review entries from upstream")
    groups: dict[tuple, dict] = defaultdict(lambda: {"date": None, "specs": []})
    for e in raw:
        key = (e.teacher, e.message)
        groups[key]["date"] = groups[key]["date"] or e.date
        groups[key]["specs"].append(e.full_spec)
    result = [
        ReviewGroup(teacher=teacher, message=message, date=g["date"], specs=g["specs"])
        for (teacher, message), g in groups.items()
    ]
    log.info(f"Reviews: {len(raw)} upstream entries → {len(result)} grouped")
    return result


@router.get("/list", response_model=list[ReviewGroup])
async def get_reviews(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    raw = await cache.get_or_fetch(
        key=f"reviews:list:{user['username']}",
        ttl=TTL.REVIEWS,
        fetch=lambda: client.get("/reviews/index/list"),
    )
    return _group_reviews(raw)