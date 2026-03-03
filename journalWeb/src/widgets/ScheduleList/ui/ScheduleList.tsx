import { scheduleApi } from "@/entities/schedule/api"
import { useScheduleStore } from "@/entities/schedule/model/store"
import type { LessonItem } from "@/entities/schedule/model/types"
import { ttl } from "@/shared/config/cache"
import { CACHE_KEYS, storage } from "@/shared/lib/storage"
import { useEffect } from "react"
import { Clock, MapPin, User } from "lucide-react"

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
      <li key={`${lesson.started_at}-${lesson.room}`} className="bg-white/5 rounded-2xl backdrop-blur-sm p-3 text-xs h-[90px] relative overflow-hidden">
        <div className="text-zinc-500 text-[9px] whitespace-nowrap absolute top-3 right-3">{lesson.room}</div>
        <div className="flex items-start gap-3 h-full">
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#6FA8DC]/30 to-[#6FA8DC]/20 rounded-2xl flex items-center justify-center border border-[#6FA8DC]/20 text-lg font-bold">
            {lesson.lesson}
          </div>
          <div className="flex flex-col flex-1 min-w-0 pr-16 h-full justify-between overflow-hidden">
            <div
              className="font-medium leading-tight overflow-hidden"
              style={{
                fontSize: lesson.subject.length > 30 ? '11px' : lesson.subject.length > 20 ? '12px' : '14px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxHeight: '2.6em'
              }}
            >
              {lesson.subject}
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              <div className="text-zinc-500 flex items-center gap-1">
                <Clock size={10} />
                <span>{lesson.started_at} – {lesson.finished_at}</span>
              </div>
              <div className="text-zinc-500 flex items-center gap-1">
                <User size={10} />
                <span className="truncate">{lesson.teacher}</span>
              </div>
            </div>
          </div>
        </div>
      </li>
    ))}
  </ul>
)
}