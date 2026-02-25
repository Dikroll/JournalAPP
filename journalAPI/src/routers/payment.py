import asyncio

from app.security import get_current_user
from fastapi import APIRouter, Depends
from schemas import (
    PaymentRecord,
    PaymentSummary,
    ScheduledPayment,
    UpstreamPaymentRecord,
    UpstreamScheduledPayment,
)
from services.upstream_client import UpstreamClient, get_upstream_client

router = APIRouter(prefix="/payment", tags=["payment"])


def _adapt_schedule(raw: list) -> list[ScheduledPayment]:
    return [
        ScheduledPayment(
            id=e.id, description=e.description,
            amount=e.price, due_date=e.payment_date,
            is_paid=e.status != 0,
        )
        for e in [UpstreamScheduledPayment(**i) for i in raw]
    ]

def _adapt_history(raw: list | dict) -> list[PaymentRecord]:
    items = raw if isinstance(raw, list) else [raw]
    return [
        PaymentRecord(date=e.date, amount=e.amount, description=e.description, type=e.type)
        for e in [UpstreamPaymentRecord(**i) for i in items]
    ]


@router.get("/schedule", response_model=list[ScheduledPayment])
async def get_schedule(
    client: UpstreamClient = Depends(get_upstream_client),
):
    return _adapt_schedule(await client.get("/payment/operations/schedule"))


@router.get("/history", response_model=list[PaymentRecord])
async def get_history(

    client: UpstreamClient = Depends(get_upstream_client),
):
    return _adapt_history(await client.get("/payment/operations/history"))


@router.get("/summary", response_model=PaymentSummary)
async def get_summary(
    client: UpstreamClient = Depends(get_upstream_client),
):
    schedule_raw, history_raw = await asyncio.gather(
        client.get("/payment/operations/schedule"),
        client.get("/payment/operations/history"),
    )
    schedule = _adapt_schedule(schedule_raw)
    history  = _adapt_history(history_raw)
    unpaid   = [s for s in schedule if not s.is_paid]

    return PaymentSummary(
        total_debt=sum(s.amount for s in unpaid),
        next_payment=min(unpaid, key=lambda x: x.due_date) if unpaid else None,
        schedule=schedule,
        history=history,
    )