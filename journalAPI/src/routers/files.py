
from app.cache import cache
from app.security import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from services.upstream_client import get_http_client

router = APIRouter(prefix="/api/files", tags=["files"])
FILE_CACHE_TTL = 60 * 60 * 24 * 7   
BROWSER_MAX_AGE = 60 * 60 * 24      


@router.get("/{file_id}")
async def proxy_file(
    file_id: str,
    user: dict = Depends(get_current_user),
):
    async def _fetch() -> dict:
        client = get_http_client()
        resp = await client.get(
            f"https://fs.top-academy.ru/api/v1/files/{file_id}",
            follow_redirects=True,  
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                "Referer": "https://journal.top-academy.ru/",
            },
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="File not found")
        return {
            "content": resp.content,
            "media_type": resp.headers.get("content-type", "image/jpeg"),
        }

    result = await cache.get_or_fetch(
        key=f"file:{file_id}",
        ttl=FILE_CACHE_TTL,
        fetch=_fetch,
    )

    return Response(
        content=result["content"],
        media_type=result["media_type"],
        headers={
            "Cache-Control": f"public, max-age={BROWSER_MAX_AGE}",
            "ETag": f'"{file_id}"',
        },
    )