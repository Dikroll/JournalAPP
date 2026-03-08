
import { STATUS_CONFIG } from "@/entities/homework/config"
import type { GroupData, HomeworkItemWithStatus as HW } from "@/entities/homework/hooks/useHomeworkGroups"
import type { HomeworkStatus } from "@/entities/homework/model/homeworkStatus"
import { STATUS_KEY_MAP, STATUS_ORDER } from "@/entities/homework/model/homeworkStatus"
import type { SubjectData } from "@/entities/homework/model/store"
import type { Subject } from "@/entities/subject/model/types"
import { HomeworkCard } from "@/widgets/HomeworkList/ui/card/HomeworkCard"
import { ChevronDown } from "lucide-react"

interface Props {
  byStatus: Record<HomeworkStatus, GroupData>
  filterStatus: HomeworkStatus | null
  selectedSpec: Subject | null
  subjectData: SubjectData | undefined
  onLoadMore: (statusKey: number) => void
  onLoadMoreForSubject: (specId: number, statusKey: number) => void
}

export function HomeworkStatusView({
  byStatus,
  filterStatus,
  selectedSpec,
  subjectData,
  onLoadMore,
  onLoadMoreForSubject,
}: Props) {
  const statusesToShow = filterStatus ? [filterStatus] : STATUS_ORDER

  if (!selectedSpec) {
    return (
      <div className="space-y-6">
        {statusesToShow.map((s) => {
          const group = byStatus[s]
          if (!group?.items.length) return null
          const { label, icon: Icon, textColor } = STATUS_CONFIG[s]
          return (
            <div key={s}>
              <h2 className="text-base font-semibold text-[#F2F2F2] mb-3 flex items-center gap-2">
                <Icon size={18} className={textColor} />
                {label}
                <span className="text-sm text-[#9CA3AF] font-normal">
                  ({group.total}{group.hasMore ? "+" : ""})
                </span>
              </h2>
              <div className="space-y-3">
                {group.items.map((hw) => <HomeworkCard key={hw.id} hw={hw} />)}
              </div>
              {group.hasMore && (
                <ShowMoreBtn onClick={() => onLoadMore(STATUS_KEY_MAP[s])} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const isLoading = !subjectData || subjectData.status === "loading"

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white/5 rounded-[20px] h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {statusesToShow.map((s) => {
        const numKey = STATUS_KEY_MAP[s]
        const storeItems = subjectData.items[numKey] ?? []
        if (!storeItems.length) return null

        const displayItems: HW[] = storeItems.map((hw) => ({ ...hw, statusKey: s }))
        const total = subjectData.counters?.[s] ?? displayItems.length
        const hasMore = !subjectData.expandedStatuses.has(numKey) && displayItems.length < total
        const { label, icon: Icon, textColor } = STATUS_CONFIG[s]

        return (
          <div key={s}>
            <h2 className="text-base font-semibold text-[#F2F2F2] mb-3 flex items-center gap-2">
              <Icon size={18} className={textColor} />
              {label}
              <span className="text-sm text-[#9CA3AF] font-normal">
                ({total}{hasMore ? "+" : ""})
              </span>
            </h2>
            <div className="space-y-3">
              {displayItems.map((hw) => <HomeworkCard key={hw.id} hw={hw as any} />)}
            </div>
            {hasMore && (
              <ShowMoreBtn onClick={() => onLoadMoreForSubject(selectedSpec.id, numKey)} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ShowMoreBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm text-[#9CA3AF] hover:text-[#F2F2F2] transition-colors"
    >
      <ChevronDown size={16} />
      Показать ещё
    </button>
  )
}