from fastapi import APIRouter, Depends

from app.security import get_current_user
from schemas import NewsItem, UpstreamNewsItem
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/latest", response_model=list[NewsItem])
async def get_latest_news(
    user: dict = Depends(get_current_user),
    client: UpstreamClient = Depends(get_upstream_client),
):
    raw = [UpstreamNewsItem(**e) for e in await client.get("/news/operations/latest-news")]
    return [NewsItem(id=e.id_bbs, title=e.theme, published_at=e.time, is_read=e.viewed) for e in raw]