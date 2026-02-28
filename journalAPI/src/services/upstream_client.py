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

# один глобальный httpx клиент с connection pool
_http: httpx.AsyncClient | None = None


def get_http_client() -> httpx.AsyncClient:
    global _http
    if _http is None or _http.is_closed:
        _http = httpx.AsyncClient(
            timeout=httpx.Timeout(10.0),
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
            http2=True,  # HTTP/2 если сервер поддерживает
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

    async def _request(self, method: str, path: str, **kwargs) -> dict | list:
        if not self._token or self._is_token_expired():
            await self._login()

        log.debug(f"[{method}] {path}")
        headers = {**DEFAULT_HEADERS, "Authorization": f"Bearer {self._token}"}

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
            log.error(f"[{method}] {path} — {resp.status_code}: {resp.text}")
            raise HTTPException(status_code=resp.status_code, detail=resp.text)

        data = resp.json()
        log.debug(f"[{method}] {path} — OK, items: {len(data) if isinstance(data, list) else 1}")
        return data

    async def get(self, path: str, params: dict | None = None) -> dict | list:
        return await self._request("GET", path, params=params)

    async def post(self, path: str, json: dict | None = None) -> dict | list:
        return await self._request("POST", path, json=json)


def get_upstream_client(user: dict = Depends(get_current_user)) -> UpstreamClient:
    username = user["username"]
    if username not in _clients:
        log.debug(f"[CACHE] creating new client for '{username}'")
        _clients[username] = UpstreamClient(username, user["password"])
    else:
        log.debug(f"[CACHE] reusing client for '{username}'")
    return _clients[username]