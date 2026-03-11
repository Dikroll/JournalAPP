import httpx
from app.cache import cache
from app.config import settings
from fastapi import APIRouter, Response
from fastapi.responses import Response

router = APIRouter(prefix="/files", tags=["files"])

FS_BASE = "https://fs.top-academy.ru/api/v1/files"
FILE_TTL = 60 * 60 * 24  



@router.get("/{file_token}")
async def proxy_file(file_token: str):
    async def fetch():
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{FS_BASE}/{file_token}", follow_redirects=True)
        if resp.status_code != 200:
            return None
        
        content_type = resp.headers.get("content-type", "image/jpeg")
        if "octet-stream" in content_type or content_type == "application/octet-stream":
            content_type = "image/jpeg"
        
        return {"content": resp.content, "content_type": content_type}

    result = await cache.get_or_fetch(
        key=f"file:{file_token}",
        ttl=FILE_TTL,
        fetch=fetch,
    )

    if result is None:
        return Response(status_code=404)

    return Response(
        content=result["content"],
        media_type=result["content_type"],
        headers={
            "Cache-Control": "public, max-age=86400, immutable",
            "Expires": "86400",
            "Pragma": "cache",
        }
    )