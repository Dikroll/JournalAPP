from fastapi import APIRouter, Depends

from app.security import get_current_user
from schemas import (
    GamingPoints,
    Group,
    PointBalance,
    Stream,
    UpstreamUserInfo,
    UserInfo,
)
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/user", tags=["user"])


def _adapt(raw: UpstreamUserInfo) -> UserInfo:
    earned = {p.new_gaming_point_types__id: p.points for p in raw.gaming_points}
    spent  = {p.new_gaming_point_types__id: p.points for p in raw.spent_gaming_points}

    d_e, d_s = earned.get(1, 0), spent.get(1, 0)
    c_e, c_s = earned.get(2, 0), spent.get(2, 0)

    return UserInfo(
        student_id=raw.student_id,
        full_name=raw.full_name,
        photo_url=raw.photo,
        age=raw.age,
        gender=raw.gender,
        birthday=raw.birthday,
        registered_at=raw.registration_date,
        last_seen_at=raw.last_date_visit,
        study_form=raw.study_form_short_name,
        level=raw.level,
        achieves_count=raw.achieves_count,
        group=Group(id=raw.current_group_id, name=raw.group_name, status=raw.current_group_status),
        stream=Stream(id=raw.stream_id, name=raw.stream_name),
        points=GamingPoints(
            diamonds=PointBalance(earned=d_e, spent=d_s, balance=d_e - d_s),
            coins=PointBalance(earned=c_e, spent=c_s, balance=c_e - c_s),
        ),
        is_debtor=raw.visibility.is_debtor,
        has_homework_issues=raw.visibility.is_dz_group_issue,
    )


@router.get("/me", response_model=UserInfo)
async def get_me(
    user: dict = Depends(get_current_user),
    client: UpstreamClient = Depends(get_upstream_client),
):
    raw = UpstreamUserInfo(**(await client.get("/settings/user-info")))
    return _adapt(raw)