"""
Универсальный кэш.

Использование:
    from app.cache import cache

    result = await cache.get_or_fetch(
        key="user:info:{username}",
        ttl=300,
        fetch=lambda: client.get("/settings/user-info"),
    )
"""
import asyncio
import time
from typing import Any, Awaitable, Callable

from app.logger import setup_logger

log = setup_logger("cache")


class CacheEntry:
    __slots__ = ("value", "expires_at")

    def __init__(self, value: Any, ttl: int):
        self.value = value
        self.expires_at = time.monotonic() + ttl


class Cache:
    def __init__(self) -> None:
        self._store: dict[str, CacheEntry] = {}
        self._locks: dict[str, asyncio.Lock] = {}

    async def get_or_fetch(
        self,
        key: str,
        ttl: int,
        fetch: Callable[[], Awaitable[Any]],
    ) -> Any:
        """
        Возвращает значение из кэша или вызывает fetch() если кэш пуст/устарел.
        Защита от thundering herd — одновременные запросы с одним ключом
        не дублируют вызов fetch().
        """
        entry = self._store.get(key)
        if entry and time.monotonic() < entry.expires_at:
            log.debug(f"[HIT] {key}")
            return entry.value
        if key not in self._locks:
            self._locks[key] = asyncio.Lock()
        lock = self._locks[key]

        async with lock:
            
            entry = self._store.get(key)
            if entry and time.monotonic() < entry.expires_at:
                log.debug(f"[HIT after lock] {key}")
                return entry.value

            log.debug(f"[MISS] {key} — fetching")
            value = await fetch()
            self._store[key] = CacheEntry(value, ttl)
            return value

    def invalidate(self, prefix: str) -> int:
        """Удалить все ключи начинающиеся с prefix. Возвращает кол-во удалённых."""
        keys = [k for k in self._store if k.startswith(prefix)]
        for k in keys:
            del self._store[k]
            self._locks.pop(k, None)
        log.debug(f"[INVALIDATE] prefix='{prefix}' removed {len(keys)} keys")
        return len(keys)

    def invalidate_key(self, key: str) -> None:
        self._store.pop(key, None)
        self._locks.pop(key, None)

    def stats(self) -> dict:
        now = time.monotonic()
        alive = sum(1 for e in self._store.values() if now < e.expires_at)
        return {"total_keys": len(self._store), "alive": alive, "expired": len(self._store) - alive}


cache = Cache()


class TTL:
    USER_INFO     = 60 * 60 * 24      # 24 часа  — профиль стабилен
    SCHEDULE      = 60 * 60 * 4       # 4 часа  — расписание меняется редко
    LEADERBOARD   = 60 * 60 * 1       # 1 час    — рейтинг пересчитывается нечасто
    ACTIVITY      = 60 * 60 * 2       # 2 часа
    COUNTERS      = 60 * 15           # 15 мин   — счётчики должны быть относительно свежими
    HW_COUNTERS   = 60 * 15           # 15 мин
    REVIEWS       = 60 * 60 * 6       # 6 часов  — отзывы пишут редко
    NEWS          = 60 * 60 * 24      # 24 часа  — новости раз в день
    PAYMENT       = 60 * 60 * 24 * 15 # 15 дней  — платежи раз в месяц
    SPECS         = 60 * 60 * 24 * 7  # 7 дней   — список предметов почти не меняется
    LIBRARY       = 60 * 60 * 24      # 24 часа
    MARKET        = 60 * 60 * 24      # 24 часа  — товары меняются редко
    FEEDBACK      = 60 * 90           # 90 мин   — появляется после пары
    QUIZZES       = 60 * 60 * 24      # 24 часа
    CHARTS        = 60 * 60 * 24      # 24 часа