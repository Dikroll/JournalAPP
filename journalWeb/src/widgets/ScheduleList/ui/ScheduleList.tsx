import { useScheduleToday } from "@/entities/schedule/hooks/useScheduleToday"
import { toMinutes, useCurrentMinutes } from "@/shared/hooks/useCurrentTime"
import { Clock, MapPin, User } from "lucide-react"

export function ScheduleList() {
  const { today, status, error } = useScheduleToday()
  const nowMinutes = useCurrentMinutes()

  if (status === "loading" && today.length === 0)
    return <p className="text-[#9CA3AF] text-sm">Загрузка...</p>

  if (status === "error")
    return <p className="text-[#DC2626] text-sm">{error}</p>

  if (today.length === 0)
    return <p className="text-[#9CA3AF] text-sm">Пар сегодня нет</p>

  return (
    <ul className="flex flex-col gap-2">
      {today.map((lesson) => {
        const isCurrent =
          nowMinutes >= toMinutes(lesson.started_at) &&
          nowMinutes <= toMinutes(lesson.finished_at)

        return (
          <li
            key={`${lesson.started_at}-${lesson.room}`}
            className={`rounded-2xl px-3 py-3 border transition-all ${
              isCurrent
                ? "bg-white/10 border-white/20 shadow-lg shadow-black/30"
                : "bg-white/5 border-white/5"
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                isCurrent
                  ? "bg-[#F20519]/20 border border-[#F20519]/40"
                  : "bg-white/8 border border-white/15"
              }`}>
                <span className={`text-[11px] font-bold leading-none ${
                  isCurrent ? "text-[#F20519]" : "text-[#9CA3AF]"
                }`}>
                  {lesson.lesson}
                </span>
              </div>
              <p
                className="flex-1 font-semibold text-[#F2F2F2] leading-snug text-[13px]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {lesson.subject}
              </p>
            </div>

            {/* Время */}
            <div className="flex items-center gap-1.5 text-[#9CA3AF] mb-1 pl-8">
              <Clock size={10} />
              <span className="text-[11px]">{lesson.started_at} – {lesson.finished_at}</span>
            </div>

            {/* Преподаватель */}
            <div className="flex items-center gap-1.5 text-[#9CA3AF] mb-2 pl-8">
              <User size={10} />
              <span className="text-[10px] truncate">{lesson.teacher}</span>
            </div>

            {/* Аудитория */}
            <div className="pl-8">
              <div className="inline-flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-0.5">
                <MapPin size={9} className="text-[#6B7280] flex-shrink-0" />
                <span className="text-[10px] text-[#6B7280]">{lesson.room}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}