import { useScheduleMonth } from "@/entities/schedule/hooks/useScheduleMonth"
import { formatDateLong, getTodayString, toDateString } from "@/shared/utils/dateUtils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { LessonList } from "../../ScheduleList/ui/LessonList"

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]

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
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString())

  const todayStr = getTodayString()
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
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  return (
    <div className="flex flex-col gap-4">

      <div className="bg-white/5 rounded-3xl backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={prevMonth} className="text-white/60 hover:text-white transition-colors p-1">
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-sm">{MONTHS[month]} {year}</span>
          <button type="button" onClick={nextMonth} className="text-white/60 hover:text-white transition-colors p-1">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className={`text-center text-[10px] font-medium pb-2 ${
                d === "Сб" || d === "Вс" ? "text-white/30" : "text-white/50"
              }`}
            >
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
                const isToday = dateStr === todayStr
                const hasLesson = dateStr ? daysWithLessons.has(dateStr) : false
                const isGray = !hasLesson || isWeekend

                return (
                  <div key={di} className="flex items-center justify-center py-1">
                    <div
                      onClick={() => day && setSelectedDate(dateStr)}
                      className={`
                        w-9 h-9 flex items-center justify-center rounded-full text-xs font-semibold transition-colors relative
                        ${isSelected ? "bg-[#F20519]/70 text-white" : ""}
                        ${!isSelected && isGray && day ? "text-white/30" : ""}
                        ${!isSelected && !isGray && day ? "text-white hover:bg-white/10" : ""}
                        ${day ? "cursor-pointer" : ""}
                      `}
                    >
                      {day}
                      {isToday && !isSelected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#F20519]/70" />
                      )}
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
          <p className="text-xs text-white/40 mb-2 px-1 capitalize">
            {formatDateLong(selectedDate)}
          </p>
          <LessonList lessons={selectedLessons} forDate={selectedDate} />
        </div>
      )}
    </div>
  )
}