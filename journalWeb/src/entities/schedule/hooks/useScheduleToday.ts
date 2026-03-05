import { scheduleApi } from "@/entities/schedule/api"
import { useScheduleStore } from "@/entities/schedule/model/store"
import type { LessonItem } from "@/entities/schedule/model/types"
import { ttl } from "@/shared/config/cache"
import { cachedFetch } from "@/shared/lib/cachedFetch"
import { CACHE_KEYS } from "@/shared/lib/storage"
import { useEffect } from "react"


export function useScheduleToday() {
  const { today, status, error, setToday, setStatus, setError } = useScheduleStore()

  useEffect(() => {
    setStatus("loading")

    cachedFetch<LessonItem[]>({
      key: CACHE_KEYS.SCHEDULE_TODAY,
      fetcher: () => scheduleApi.getToday(),
      ttlSeconds: ttl.SCHEDULE,
      onData: (data) => {
        setToday(data)
        setStatus("success")
      },
      onError: (err) => {
        const msg =
          (err as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ?? "Ошибка загрузки расписания"
        setError(msg)
        setStatus("error")
      },
    })
  }, [])

  return { today, status, error }
}