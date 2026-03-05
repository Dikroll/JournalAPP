import { scheduleApi } from "@/entities/schedule/api"
import type { LessonItem } from "@/entities/schedule/model/types"
import { ttl } from "@/shared/config/cache"
import { cachedFetch } from "@/shared/lib/cachedFetch"
import { CACHE_KEYS } from "@/shared/lib/storage"
import { useState, useEffect } from "react"

export function useScheduleMonth(date: string) {
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  useEffect(() => {
    if (!date) return
    setStatus("loading")

    cachedFetch<LessonItem[]>({
      key: CACHE_KEYS.SCHEDULE_MONTH(date),
      fetcher: () => scheduleApi.getMonth(date),
      ttlSeconds: ttl.SCHEDULE,
      onData: (data) => {
        setLessons(data)
        setStatus("success")
      },
      onError: () => {
        setStatus("error")
      },
    })
  }, [date])

  return { lessons, status }
}