import {
	getDaysInMonth,
	getFirstDayOfMonth,
	getTodayString,
	RU_DAYS_SHORT,
	RU_MONTHS,
	toDateString,
} from "@/shared/lib/dateUtils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface MonthGridDayInfo {
  dateStr: string  
  day: number
  isToday: boolean
}

interface Props {
  year: number
  month: number    
  onPrevMonth: () => void
  onNextMonth: () => void
  renderDay: (info: MonthGridDayInfo) => React.ReactNode
}

export function MonthGrid({ year, month, onPrevMonth, onNextMonth, renderDay }: Props) {
  const todayStr = getTodayString()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  return (
    <div
      className="bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/10"
      style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onPrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-[#9CA3AF] transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-[#F2F2F2]">
          {RU_MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-[#9CA3AF] transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {RU_DAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[10px] text-[#6B7280] font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = toDateString(year, month, day)
          return (
            <div key={day} className="flex items-center justify-center">
              {renderDay({ dateStr, day, isToday: dateStr === todayStr })}
            </div>
          )
        })}
      </div>
    </div>
  )
}