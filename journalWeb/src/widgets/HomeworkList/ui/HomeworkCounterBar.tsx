import type { HomeworkCounters } from "@/entities/homework/model/types"

interface Props {
  counters: HomeworkCounters
}

const ITEMS = [
  { key: "total",    label: "Всего",       color: "text-[#F2F2F2]" },
  { key: "new",      label: "Новых",       color: "text-[#3B82F6]" },
  { key: "pending",  label: "На проверке", color: "text-[#3B82F6]" },
  { key: "checked",  label: "Проверено",   color: "text-[#10B981]" },
  { key: "overdue",  label: "Просрочено",  color: "text-[#DC2626]" },
  { key: "returned", label: "Возвращено",  color: "text-[#6B7280]" },
] as const

export function HomeworkCountersBar({ counters }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {ITEMS.map(({ key, label, color }) => (
        <div
          key={key}
          className="flex-shrink-0 px-3 py-2 bg-white/5 rounded-2xl border border-white/10 text-center min-w-[72px]"
        >
          <div className={`text-lg font-bold ${color}`}>{counters[key]}</div>
          <div className="text-xs text-[#9CA3AF]">{label}</div>
        </div>
      ))}
    </div>
  )
}