import { STATUS_CONFIG } from "@/entities/homework/config"
import type { HomeworkItemWithStatus } from "@/entities/homework/hooks/useHomeworkGroups"

interface Props {
  hw: HomeworkItemWithStatus
  gradeStyle: { badge: string } | null
  grade: number | null
}

export function HomeworkCardHeader({ hw, gradeStyle, grade }: Props) {
  const config = STATUS_CONFIG[hw.statusKey]
  const StatusIcon = config.icon
  const isChecked = hw.statusKey === "checked"

  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StatusIcon size={16} className={`${config.textColor} flex-shrink-0`} />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.textColor} bg-white/5`}>
            {config.label}
          </span>
        </div>
        <h3 className="text-base font-semibold text-[#F2F2F2] leading-snug">
          {hw.spec_name}
        </h3>
        <p className="text-sm text-[#9CA3AF] line-clamp-2 mt-0.5">{hw.theme}</p>
      </div>

      {isChecked && grade != null && (
        <div className={`ml-3 flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border ${gradeStyle!.badge}`}>
          {grade}
        </div>
      )}
    </div>
  )
}