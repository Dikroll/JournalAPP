import type { HomeworkCounters } from "@/entities/homework/model/types"
import type { HomeworkStatus } from "@/entities/homework/model/useHomeworkGroups"

interface Props {
  counters: HomeworkCounters
  activeFilter: HomeworkStatus | null
  onFilter: (key: HomeworkStatus | null) => void
}

const ITEMS = [
  { key: "total",    label: "Всего",       color: "text-[#F2F2F2]", ring: "ring-white/40",    status: null },
  { key: "new",      label: "Новых",       color: "text-[#3B82F6]", ring: "ring-[#3B82F6]",   status: "new" as HomeworkStatus },
  { key: "pending",  label: "На проверке", color: "text-[#3B82F6]", ring: "ring-[#3B82F6]",   status: "pending" as HomeworkStatus },
  { key: "checked",  label: "Проверено",   color: "text-[#10B981]", ring: "ring-[#10B981]",   status: "checked" as HomeworkStatus },
  { key: "overdue",  label: "Просрочено",  color: "text-[#DC2626]", ring: "ring-[#DC2626]",   status: "overdue" as HomeworkStatus },
  { key: "returned", label: "Возвращено",  color: "text-[#6B7280]", ring: "ring-[#6B7280]",   status: "returned" as HomeworkStatus },
] as const

export function HomeworkCountersBar({ counters, activeFilter, onFilter }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {ITEMS.map(({ key, label, color, ring, status }) => {
        const isActive = activeFilter === status
        return (
          <button
            key={key}
            type="button"
            onClick={() => onFilter(isActive ? null : status)}
            className={[
              "flex-shrink-0 px-3 py-2 rounded-2xl text-center min-w-[72px] transition-all duration-200 active:scale-95",
              isActive
                ? `bg-white/10 ring-2 ${ring}`
                : "bg-white/5 border border-white/10 hover:bg-white/8",
            ].join(" ")}
          >
            <div className={`text-lg font-bold ${color}`}>{counters[key]}</div>
            <div className="text-xs text-[#9CA3AF]">{label}</div>
          </button>
        )
      })}
    </div>
  )
}