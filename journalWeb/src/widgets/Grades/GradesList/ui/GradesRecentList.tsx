
import type { GradeEntryExpanded } from "@/entities/grades/hooks/useGradesGroups"
import { GradeEntryRow } from "./GradeEntryRow"

interface Props {
  byDate: Array<{ date: string; items: GradeEntryExpanded[] }>
}

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Сегодня"
  if (date.toDateString() === yesterday.toDateString()) return "Вчера"

  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" })
}

export function GradesRecentList({ byDate }: Props) {
  if (byDate.length === 0) {
    return <p className="text-[#9CA3AF] text-sm text-center py-8">Нет записей</p>
  }

  return (
    <div className="space-y-4">
      {byDate.map(({ date, items }) => (
        <div key={date} className="space-y-2">
          <div className="text-sm font-medium text-[#9CA3AF] px-1">{formatDate(date)}</div>
          <div className="bg-white/5 backdrop-blur-xl rounded-[24px] p-3 border border-white/10"
            style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.3)" }}>
            {items.map((entry, idx) => (
              <div key={`${entry.date}-${entry.lesson_number}-${entry.spec_id}-${idx}`}>
                {idx > 0 && <div className="border-t border-white/5 my-1" />}
                <GradeEntryRow entry={entry} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}