import { STATUS_CONFIG } from "@/entities/homework/config"
import type { HomeworkItemWithStatus } from "@/entities/homework/hooks/useHomeworkGroups"
import type { HomeworkStatus } from "@/entities/homework/model/homeworkStatus"
import { HomeworkCard } from "@/widgets/HomeworkList/ui/card/HomeworkCard"
import { ChevronDown, RefreshCw } from "lucide-react"

interface Props {
  status: HomeworkStatus
  items: HomeworkItemWithStatus[]
  total: number
  hasMore: boolean
  isLoading?: boolean
  onLoadMore: () => void
}

export function HomeworkStatusSection({
  status,
  items,
  total,
  hasMore,
  isLoading = false,
  onLoadMore,
}: Props) {
  if (items.length === 0) return null

  const { label, icon: Icon, textColor } = STATUS_CONFIG[status]

  return (
    <div>
      <h3 className="text-sm text-[#9CA3AF] flex items-center gap-1.5 mb-2">
        <Icon size={13} className={textColor} />
        {label}
        <span className="text-xs">({total}{hasMore ? "+" : ""})</span>
      </h3>

      <div className="space-y-3">
        {items.map((hw) => (
          <HomeworkCard key={hw.id} hw={hw} />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          disabled={isLoading}
          onClick={onLoadMore}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm text-[#9CA3AF] hover:text-[#F2F2F2] transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <><RefreshCw size={14} className="animate-spin" /> Загрузка...</>
          ) : (
            <><ChevronDown size={16} /> Показать ещё ({total - items.length}+)</>
          )}
        </button>
      )}
    </div>
  )
}