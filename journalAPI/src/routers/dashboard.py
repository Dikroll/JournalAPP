import asyncio

from app.cache import TTL, cache
from app.security import get_current_user
from fastapi import APIRouter, Depends
from schemas import (
    ActivityEntry,
    ChartPoint,
    Counters,
    Leaderboard,
    LeaderEntry,
    QuizItem,
    QuizRetries,
    RankInfo,
    UpstreamActivityEntry,
    UpstreamChartPoint,
    UpstreamCounter,
    UpstreamLeaderEntry,
    UpstreamLeaderPoints,
    UpstreamQuizItem,
)
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

_PAGE_MAP = {100: "homework", 200: "messages", 300: "reviews", 400: "vacancies", 500: "news", 600: "signals", 700: "profile"}


def _rank(raw: dict) -> RankInfo:
    u = UpstreamLeaderPoints(**raw)
    return RankInfo(position=u.studentPosition, total=u.totalCount, week_diff=u.weekDiff, month_diff=u.monthDiff)


def _top(raw: list) -> list[LeaderEntry]:
    return [
        LeaderEntry(student_id=e.id, full_name=e.full_name, photo_url=e.photo_path, position=e.position, points=e.amount)
        for e in [UpstreamLeaderEntry(**i) for i in raw]
        if e.id is not None
    ]


@router.get("/counters", response_model=Counters)
async def get_counters(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    raw = await cache.get_or_fetch(
        key=f"dashboard:counters:{user['username']}",
        ttl=TTL.COUNTERS,
        fetch=lambda: client.get("/count/page-counters", params={"filter_type": 0}),
    )
    return Counters(**{_PAGE_MAP[c.counter_type]: c.counter
                       for c in [UpstreamCounter(**e) for e in raw]
                       if c.counter_type in _PAGE_MAP})


@router.get("/leaderboard/stream", response_model=Leaderboard)
async def get_leaderboard_stream(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    pos_raw, top_raw = await asyncio.gather(
        cache.get_or_fetch(f"leader:stream:pos:{user['username']}", TTL.LEADERBOARD,
                           lambda: client.get("/dashboard/progress/leader-stream-points")),
        cache.get_or_fetch(f"leader:stream:top:{user['username']}", TTL.LEADERBOARD,
                           lambda: client.get("/dashboard/progress/leader-stream")),
    )
    return Leaderboard(my_rank={"stream": _rank(pos_raw)}, top_group=[], top_stream=_top(top_raw))


@router.get("/leaderboard/group", response_model=Leaderboard)
async def get_leaderboard_group(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    pos_raw, top_raw = await asyncio.gather(
        cache.get_or_fetch(f"leader:group:pos:{user['username']}", TTL.LEADERBOARD,
                           lambda: client.get("/dashboard/progress/leader-group-points")),
        cache.get_or_fetch(f"leader:group:top:{user['username']}", TTL.LEADERBOARD,
                           lambda: client.get("/dashboard/progress/leader-group")),
    )
    return Leaderboard(my_rank={"group": _rank(pos_raw)}, top_group=_top(top_raw), top_stream=[])


@router.get("/leaderboard", response_model=Leaderboard)
async def get_leaderboard(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    grp_pos, str_pos, str_top, grp_top = await asyncio.gather(
        cache.get_or_fetch(f"leader:group:pos:{user['username']}", TTL.LEADERBOARD,
                           lambda: client.get("/dashboard/progress/leader-group-points")),
        cache.get_or_fetch(f"leader:stream:pos:{user['username']}", TTL.LEADERBOARD,
                           lambda: client.get("/dashboard/progress/leader-stream-points")),
        cache.get_or_fetch(f"leader:stream:top:{user['username']}", TTL.LEADERBOARD,
                           lambda: client.get("/dashboard/progress/leader-stream")),
        cache.get_or_fetch(f"leader:group:top:{user['username']}", TTL.LEADERBOARD,
                           lambda: client.get("/dashboard/progress/leader-group")),
    )
    return Leaderboard(
        my_rank={"group": _rank(grp_pos), "stream": _rank(str_pos)},
        top_group=_top(grp_top), top_stream=_top(str_top),
    )


@router.get("/activity", response_model=list[ActivityEntry])
async def get_activity(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    raw = await cache.get_or_fetch(
        key=f"dashboard:activity:{user['username']}",
        ttl=TTL.ACTIVITY,
        fetch=lambda: client.get("/dashboard/progress/activity"),
    )
    return [ActivityEntry(date=e.date, points=e.current_point, point_type=e.point_types_name, achievement=e.achievements_name)
            for e in [UpstreamActivityEntry(**i) for i in raw]]


@router.get("/quizzes", response_model=list[QuizItem])
async def get_quizzes(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    data = await cache.get_or_fetch(
        key=f"dashboard:quizzes:{user['username']}",
        ttl=TTL.QUIZZES,
        fetch=lambda: client.get("/library/operations/list", params={"material_type": 7, "recommended_type": 0}),
    )
    raw = [UpstreamQuizItem(**e) for e in (data if isinstance(data, list) else [data])]
    return [
        QuizItem(
            material_id=e.material_id, quiz_id=e.quiz_id, theme=e.theme,
            questions_count=e.questions_count, time_limit_seconds=e.time_limit,
            cooldown_seconds=e.retake_time,
            retries=QuizRetries(total=e.retries_number, used=e.retries_number_end,
                                remaining=e.retries_number - e.retries_number_end),
            last_mark=e.last_mark, passed_at=e.passed_at,
            week=e.current_week, date=e.date, is_new=e.is_new_material,
        ) for e in raw
    ]

@router.get("/chart/average-progress", response_model=list[ChartPoint])
async def get_average_progress(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    raw = await cache.get_or_fetch(
        key=f"dashboard:chart:progress:{user['username']}",
        ttl=TTL.CHARTS,  
        fetch=lambda: client.get("/dashboard/chart/average-progress"),
    )
    return [
        ChartPoint(
            date=e.date,
            points=e.points,
            previous_points=e.previous_points,
            has_rasp=e.has_rasp,
        )
        for e in [UpstreamChartPoint(**i) for i in raw]
    ]


@router.get("/chart/attendance", response_model=list[ChartPoint])
async def get_attendance_chart(
    client: UpstreamClient = Depends(get_upstream_client),
    user: dict = Depends(get_current_user),
):
    raw = await cache.get_or_fetch(
        key=f"dashboard:chart:attendance:{user['username']}",
        ttl=TTL.CHARTS,  
        fetch=lambda: client.get("/dashboard/chart/attendance"),
    )
    return [
        ChartPoint(
            date=e.date,
            points=e.points,
            previous_points=e.previous_points,
            has_rasp=e.has_rasp,
        )
        for e in [UpstreamChartPoint(**i) for i in raw]
    ]