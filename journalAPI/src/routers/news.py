from app.cache import TTL, cache
from app.security import get_current_user
from fastapi import APIRouter, Depends
from schemas import NewsItem, UpstreamNewsItem
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/latest", response_model=list[NewsItem])
async def get_latest_news(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    raw = await cache.get_or_fetch(
        key=f"news:latest:{user['username']}",
        ttl=TTL.NEWS,
        fetch=lambda: client.get("/news/operations/latest-news"),
    )
    return [NewsItem(id=e.id_bbs, title=e.theme, published_at=e.time, is_read=e.viewed)
            for e in [UpstreamNewsItem(**i) for i in raw]]