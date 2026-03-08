import asyncio
import time
from contextlib import asynccontextmanager

import httpx
from app.config import settings
from app.logger import setup_logger
from app.security import get_current_user
from fastapi import Depends, HTTPException

log = setup_logger("upstream")

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ru_RU, ru",
    "Content-Type": "application/json",
    "Origin": "https://journal.top-academy.ru",
    "Referer": "https://journal.top-academy.ru/",
}

_clients: dict[str, "UpstreamClient"] = {}

_http: httpx.AsyncClient | None = None


def get_http_client() -> httpx.AsyncClient:
    global _http
    if _http is None or _http.is_closed:
        _http = httpx.AsyncClient(
            timeout=httpx.Timeout(10.0),
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
            http2=True,  
        )
    return _http


class UpstreamClient:
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password
        self._token: str | None = None
        self._token_expires_at: float = 0
        self._login_lock = asyncio.Lock()

    def _is_token_expired(self) -> bool:
        return time.time() >= self._token_expires_at - 60

    async def _login(self) -> None:
        async with self._login_lock:
            if self._token and not self._is_token_expired():
                return

            log.info(f"[AUTH] logging in as '{self.username}'")
            resp = await get_http_client().post(
                f"{settings.UPSTREAM_BASE_URL}/auth/login",
                headers=DEFAULT_HEADERS,
                json={
                    "application_key": settings.UPSTREAM_APP_KEY,
                    "username": self.username,
                    "password": self.password,
                    "id_city": None,
                },
            )

            if resp.status_code != 200:
                log.error(f"[AUTH] failed — {resp.status_code}: {resp.text}")
                raise HTTPException(status_code=401, detail="Invalid credentials for upstream")

            data = resp.json()
            self._token = data.get("token") or data.get("access_token") or data.get("jwt")
            log.debug(f"[AUTH] full response: {data}")
            if not self._token:
                raise HTTPException(status_code=502, detail=f"Unexpected auth response: {data}")

            expires = data.get("expires_in_access") or data.get("expires_in")
            self._token_expires_at = float(expires) if expires else time.time() + 6 * 3600
            log.info(f"[AUTH] login successful, expires at {self._token_expires_at}")

    async def _request(self, method: str, path: str, content_type_override: str | None = None, **kwargs) -> dict | list:
        if not self._token or self._is_token_expired():
            await self._login()

        log.debug(f"[{method}] {path}")
        base_headers = {k: v for k, v in DEFAULT_HEADERS.items() if not (content_type_override and k == "Content-Type")}
        headers = {**base_headers, "Authorization": f"Bearer {self._token}"}

        resp = await get_http_client().request(
            method,
            f"{settings.UPSTREAM_BASE_URL}{path}",
            headers=headers,
            **kwargs,
        )

        if resp.status_code == 401:
            log.warning(f"[{method}] {path} — 401, forcing re-login")
            self._token = None
            self._token_expires_at = 0
            await self._login()
            headers["Authorization"] = f"Bearer {self._token}"
            resp = await get_http_client().request(
                method,
                f"{settings.UPSTREAM_BASE_URL}{path}",
                headers=headers,
                **kwargs,
            )

        if resp.status_code >= 400:
            try:
                req_body = resp.request.content
            except Exception:
                req_body = b"<streaming>"
            log.error(f"[{method}] {path} — {resp.status_code}: {resp.text} | raw_bytes: {req_body!r}")
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        if not resp.content:
            return {}

        data = resp.json()
        log.debug(f"[{method}] {path} — OK, items: {len(data) if isinstance(data, list) else 1}")
        return data
    async def get(self, path: str, params: dict | None = None) -> dict | list:
        return await self._request("GET", path, params=params)

    async def post(self, path: str, json: dict | None = None) -> dict | list:
        return await self._request("POST", path, json=json)

    async def post_form(self, path: str, data: dict) -> dict | list:
        # httpx выставит multipart/form-data автоматически при files=
        files = {k: (None, str(v)) for k, v in data.items()}
        return await self._request("POST", path, files=files, content_type_override="multipart/form-data")

    async def upload_file(self, file_content: bytes, filename: str, content_type: str) -> dict:
        """
        Двухшаговый upload файла на fs.top-academy.ru:
          1. POST /auth/file-token  → получаем {dir, token, url}
          2. POST {url}/api/v1/files с multipart → возвращаем {filename, file_path, tmp_file}
        """
        if not self._token or self._is_token_expired():
            await self._login()

        token_headers = {**DEFAULT_HEADERS, "Authorization": f"Bearer {self._token}"}
        token_resp = await get_http_client().post(
            f"{settings.UPSTREAM_BASE_URL}/auth/file-token",
            headers=token_headers,
            json={},
        )
        if token_resp.status_code >= 400:
            log.error(f"[FILE-TOKEN] {token_resp.status_code}: {token_resp.text}")
            raise HTTPException(status_code=502, detail="Failed to get file token from upstream")

        creds = token_resp.json()
        fs_url: str = creds.get("url", "https://fs.top-academy.ru")
        fs_token: str = creds.get("token", "")
        directory: str = (creds.get("dir") or {}).get("homeworkDirId", {}).get("src", "")

        log.debug(f"[FILE-TOKEN] fs_url={fs_url} dir={directory}")


        upload_headers = {
            "Authorization": f"Bearer {fs_token}",
            "X-Ignore-refresh": "",
            "Origin": "https://journal.top-academy.ru",
            "Referer": "https://journal.top-academy.ru/",
            "User-Agent": DEFAULT_HEADERS["User-Agent"],
            "Accept": DEFAULT_HEADERS["Accept"],
        }
        upload_resp = await get_http_client().post(
            f"{fs_url}/api/v1/files",
            headers=upload_headers,
            files={"files[]": (filename, file_content, content_type)},
            data={"directory": directory},
        )
        if upload_resp.status_code >= 400:
            log.error(f"[FILE-UPLOAD] {upload_resp.status_code}: {upload_resp.text}")
            raise HTTPException(status_code=502, detail="Failed to upload file to file server")

        results = upload_resp.json()
        result = results[0] if isinstance(results, list) else results
        log.info(f"[FILE-UPLOAD] success: link={result.get('link')}")

        return {
            "filename": filename,
            "file_path": result.get("link", ""),
            "tmp_file": result.get("token", ""),
        }


def get_upstream_client(user: dict = Depends(get_current_user)) -> UpstreamClient:
    username = user["username"]
    if username not in _clients:
        log.debug(f"[CACHE] creating new client for '{username}'")
        _clients[username] = UpstreamClient(username, user["password"])
    else:
        log.debug(f"[CACHE] reusing client for '{username}'")
    return _clients[username]