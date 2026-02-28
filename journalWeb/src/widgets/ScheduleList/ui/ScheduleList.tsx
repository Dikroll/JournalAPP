import { scheduleApi } from "@/entities/schedule/api"
import { useScheduleStore } from "@/entities/schedule/model/store"
import type { LessonItem } from "@/entities/schedule/model/types"
import { ttl } from "@/shared/config/cache"
import { CACHE_KEYS, storage } from "@/shared/lib/storage"
import { useEffect } from "react"

export function ScheduleList() {
  const { today, status, error, setToday, setStatus, setError } = useScheduleStore()

  useEffect(() => {
    const load = async () => {
      const cached = storage.getStale<LessonItem[]>(CACHE_KEYS.SCHEDULE_TODAY)
      if (cached) setToday(cached)

      setStatus("loading")
      try {
        const data = await scheduleApi.getToday()
        setToday(data)
        storage.set(CACHE_KEYS.SCHEDULE_TODAY, data, ttl.SCHEDULE)
        setStatus("success")
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ?? "Ошибка загрузки"
        setError(msg)
        setStatus("error")
      }
    }
    load()
  }, [setToday, setStatus, setError])

  if (status === "loading") return <p className="text-gray-500 text-sm">Загрузка...</p>
  if (status === "error") return <p className="text-red-500 text-sm">{error}</p>
  if (today.length === 0) return <p className="text-gray-400 text-sm">Пар сегодня нет</p>

  return (
    <ul className="flex flex-col gap-2">
      {today.map((lesson) => (
        <li key={`${lesson.started_at}-${lesson.room}`} className="border rounded p-3 text-sm">
          <div className="font-medium">{lesson.subject}</div>
          <div className="text-gray-500">
            {lesson.started_at} – {lesson.finished_at} · {lesson.room}
          </div>
          <div className="text-gray-500">{lesson.teacher}</div>
        </li>
      ))}
    </ul>
  )
}