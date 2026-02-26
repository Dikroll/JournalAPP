import asyncio

from app.security import get_current_user
from fastapi import APIRouter, Depends
from schemas import (
    ActivityEntry,
    Counters,
    Leaderboard,
    LeaderEntry,
    QuizItem,
    QuizRetries,
    RankInfo,
    UpstreamActivityEntry,
    UpstreamCounter,
    UpstreamLeaderEntry,
    UpstreamLeaderPoints,
    UpstreamQuizItem,
)
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

_PAGE_MAP = {100: "homework", 200: "messages", 300: "reviews", 400: "vacancies", 500: "news", 600: "signals", 700: "profile"}


@router.get("/counters", response_model=Counters)
async def get_counters(
    client: UpstreamClient = Depends(get_upstream_client),
):
    raw = [UpstreamCounter(**e) for e in await client.get("/count/page-counters", params={"filter_type": 0})]
    return Counters(**{_PAGE_MAP[c.counter_type]: c.counter for c in raw if c.counter_type in _PAGE_MAP})





@router.get("/leaderboard/stream", response_model=Leaderboard)
async def get_leaderboard_stream(
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Рейтинг потока (весь колледж)."""
    str_pos_raw, str_top_raw = await asyncio.gather(
        client.get("/dashboard/progress/leader-stream-points"),
        client.get("/dashboard/progress/leader-stream"),
    )

    def rank(raw: dict) -> RankInfo:
        u = UpstreamLeaderPoints(**raw)
        return RankInfo(position=u.studentPosition, total=u.totalCount, week_diff=u.weekDiff, month_diff=u.monthDiff)

    def top(raw: list) -> list[LeaderEntry]:
        return [
            LeaderEntry(student_id=e.id, full_name=e.full_name, photo_url=e.photo_path, position=e.position, points=e.amount)
            for e in [UpstreamLeaderEntry(**i) for i in raw]
            if e.id is not None
        ]

    return Leaderboard(
        my_rank={"stream": rank(str_pos_raw)},
        top_group=[],
        top_stream=top(str_top_raw),
    )


@router.get("/leaderboard/group", response_model=Leaderboard)
async def get_leaderboard_group(
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Рейтинг своей группы."""
    grp_pos_raw, grp_top_raw = await asyncio.gather(
        client.get("/dashboard/progress/leader-group-points"),
        client.get("/dashboard/progress/leader-group"),
    )

    def rank(raw: dict) -> RankInfo:
        u = UpstreamLeaderPoints(**raw)
        return RankInfo(position=u.studentPosition, total=u.totalCount, week_diff=u.weekDiff, month_diff=u.monthDiff)

    def top(raw: list) -> list[LeaderEntry]:
        return [
            LeaderEntry(student_id=e.id, full_name=e.full_name, photo_url=e.photo_path, position=e.position, points=e.amount)
            for e in [UpstreamLeaderEntry(**i) for i in raw]
            if e.id is not None
        ]

    return Leaderboard(
        my_rank={"group": rank(grp_pos_raw)},
        top_group=top(grp_top_raw),
        top_stream=[],
    )


@router.get("/leaderboard", response_model=Leaderboard)
async def get_leaderboard(
    client: UpstreamClient = Depends(get_upstream_client),
):
    """Оба рейтинга сразу — группа + поток."""
    grp_pos_raw, str_pos_raw, str_top_raw, grp_top_raw = await asyncio.gather(
        client.get("/dashboard/progress/leader-group-points"),
        client.get("/dashboard/progress/leader-stream-points"),
        client.get("/dashboard/progress/leader-stream"),
        client.get("/dashboard/progress/leader-group"),
    )

    def rank(raw: dict) -> RankInfo:
        u = UpstreamLeaderPoints(**raw)
        return RankInfo(position=u.studentPosition, total=u.totalCount, week_diff=u.weekDiff, month_diff=u.monthDiff)

    def top(raw: list) -> list[LeaderEntry]:
        return [
            LeaderEntry(student_id=e.id, full_name=e.full_name, photo_url=e.photo_path, position=e.position, points=e.amount)
            for e in [UpstreamLeaderEntry(**i) for i in raw]
            if e.id is not None
        ]

    return Leaderboard(
        my_rank={"group": rank(grp_pos_raw), "stream": rank(str_pos_raw)},
        top_group=top(grp_top_raw),
        top_stream=top(str_top_raw),
    )


@router.get("/activity", response_model=list[ActivityEntry])
async def get_activity(

    client: UpstreamClient = Depends(get_upstream_client),
):
    raw = [UpstreamActivityEntry(**e) for e in await client.get("/dashboard/progress/activity")]
    return [ActivityEntry(date=e.date, points=e.current_point, point_type=e.point_types_name, achievement=e.achievements_name) for e in raw]


@router.get("/quizzes", response_model=list[QuizItem])
async def get_quizzes(

    client: UpstreamClient = Depends(get_upstream_client),
):
    data = await client.get("/library/operations/list", params={"material_type": 7, "recommended_type": 0})
    raw = [UpstreamQuizItem(**e) for e in (data if isinstance(data, list) else [data])]
    return [
        QuizItem(
            material_id=e.material_id, quiz_id=e.quiz_id, theme=e.theme,
            questions_count=e.questions_count, time_limit_seconds=e.time_limit,
            cooldown_seconds=e.retake_time,
            retries=QuizRetries(total=e.retries_number, used=e.retries_number_end, remaining=e.retries_number - e.retries_number_end),
            last_mark=e.last_mark, passed_at=e.passed_at,
            week=e.current_week, date=e.date, is_new=e.is_new_material,
        )
        for e in raw
    ]


@router.get("/activity", response_model=list[ActivityEntry])
async def get_activity(

    client: UpstreamClient = Depends(get_upstream_client),
):
    raw = [UpstreamActivityEntry(**e) for e in await client.get("/dashboard/progress/activity")]
    return [ActivityEntry(date=e.date, points=e.current_point, point_type=e.point_types_name, achievement=e.achievements_name) for e in raw]