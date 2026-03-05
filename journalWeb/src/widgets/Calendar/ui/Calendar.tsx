import { useState } from "react"
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react"
import { useScheduleMonth } from "@/entities/schedule/hooks/useScheduleMonth"

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
]

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOffset(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return (day + 6) % 7
}

export function ScheduleCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string>(toDateString(now.getFullYear(), now.getMonth(), now.getDate()))

  const dateFilter = toDateString(year, month, 1)
  const { lessons } = useScheduleMonth(dateFilter)

  const totalDays = getDaysInMonth(year, month)
  const firstDayOffset = getFirstDayOffset(year, month)

  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const daysWithLessons = new Set(lessons.map((l) => l.date))
  const selectedLessons = lessons.filter((l) => l.date === selectedDate)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white/5 rounded-3xl backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="text-white/60 hover:text-white transition-colors p-1">
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-sm">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="text-white/60 hover:text-white transition-colors p-1">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className={`text-center text-[10px] font-medium pb-2 ${d === "Сб" || d === "Вс" ? "text-white/30" : "text-white/50"}`}>
              {d}
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                const isWeekend = di === 5 || di === 6
                const dateStr = day ? toDateString(year, month, day) : ""
                const isSelected = dateStr === selectedDate
                const hasLesson = dateStr ? daysWithLessons.has(dateStr) : false
                const isGray = !hasLesson || isWeekend

                return (
                  <div key={di} className="flex items-center justify-center py-1">
                    <div
                      onClick={() => day && setSelectedDate(dateStr)}
                      className={`
                        w-9 h-9 flex items-center justify-center rounded-full text-xs font-semibold transition-colors
                        ${isSelected ? "bg-red-500 text-white" : ""}
                        ${!isSelected && isGray && day ? "text-white/30" : ""}
                        ${!isSelected && !isGray && day ? "text-white hover:bg-white/10" : ""}
                        ${day ? "cursor-pointer" : ""}
                      `}
                    >
                      {day}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div>
          <p className="text-xs text-white/40 mb-2 px-1">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" })}
          </p>
          {selectedLessons.length === 0 ? (
            <p className="text-zinc-500 text-sm px-1">Пар нет</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedLessons.map((lesson) => (
                <li
                  key={`${lesson.started_at}-${lesson.room}`}
                  className="bg-white/5 rounded-2xl backdrop-blur-sm p-3 text-xs h-[90px] relative overflow-hidden"
                >
                  <div className="text-zinc-500 text-[9px] whitespace-nowrap absolute top-3 right-3">
                    {lesson.room}
                  </div>
                  <div className="flex items-start gap-3 h-full">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#6FA8DC]/30 to-[#6FA8DC]/20 rounded-2xl flex items-center justify-center border border-[#6FA8DC]/20 text-lg font-bold">
                      {lesson.lesson}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 pr-16 h-full justify-between overflow-hidden">
                      <div
                        className="font-medium leading-tight overflow-hidden"
                        style={{
                          fontSize: lesson.subject.length > 30 ? "11px" : lesson.subject.length > 20 ? "12px" : "14px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          maxHeight: "2.6em",
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
          )}
        </div>
      )}
    </div>
  )
}