import httpx
from fastapi import HTTPException

from app.config import settings
from app.logger import setup_logger

log = setup_logger("upstream")

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Origin": "https://journal.top-academy.ru",
    "Referer": "https://journal.top-academy.ru/",
}


class UpstreamClient:
    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password
        self._token: str | None = None

    async def _login(self) -> None:
        log.info(f"[AUTH] logging in as '{self.username}'")

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.UPSTREAM_BASE_URL}/auth/login",
                headers=DEFAULT_HEADERS,
                json={
                    "application_key": settings.UPSTREAM_APP_KEY,
                    "username": self.username,
                    "password": self.password,
                    "id_city": None,
                },
                timeout=10,
            )

        log.debug(f"[AUTH] status={resp.status_code}")
        log.debug(f"[AUTH] response={resp.text}")

        if resp.status_code != 200:
            log.error(f"[AUTH] failed — {resp.status_code}: {resp.text}")
            raise HTTPException(status_code=401, detail="Invalid credentials for upstream")

        data = resp.json()
        self._token = data.get("token") or data.get("access_token") or data.get("jwt")
        if not self._token:
            log.error(f"[AUTH] no token in response: {data}")
            raise HTTPException(status_code=502, detail=f"Unexpected auth response: {data}")

        log.info("[AUTH] login successful")

    async def _request(self, method: str, path: str, **kwargs) -> dict | list:
        if not self._token:
            await self._login()

        log.debug(f"[{method}] {path} params={kwargs.get('params')}")

        headers = {**DEFAULT_HEADERS, "Authorization": f"Bearer {self._token}"}

        async with httpx.AsyncClient() as client:
            resp = await client.request(
                method,
                f"{settings.UPSTREAM_BASE_URL}{path}",
                headers=headers,
                timeout=10,
                **kwargs,
            )

        if resp.status_code == 401:
            log.warning(f"[{method}] {path} — 401, re-logging in")
            await self._login()
            headers["Authorization"] = f"Bearer {self._token}"
            async with httpx.AsyncClient() as client:
                resp = await client.request(
                    method,
                    f"{settings.UPSTREAM_BASE_URL}{path}",
                    headers=headers,
                    timeout=10,
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


def get_upstream_client(user: dict) -> UpstreamClient:
    return UpstreamClient(username=user["username"], password=user["password"])