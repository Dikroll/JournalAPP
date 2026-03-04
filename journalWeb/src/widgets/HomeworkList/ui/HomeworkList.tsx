import { STATUS_CONFIG } from "@/entities/homework/config"
import type {
	GroupData,
	HomeworkStatus,
} from "@/entities/homework/model/useHomeworkGroups"
import { STATUS_KEY_MAP, STATUS_ORDER } from "@/entities/homework/model/useHomeworkGroups"
import { ChevronDown } from "lucide-react"
import { HomeworkCard } from "./HomeworkCard"

interface Props {
  groupBy: "status" | "subject"
  byStatus: Record<HomeworkStatus, GroupData>
  bySubject: Record<string, Record<HomeworkStatus, GroupData>>
  onLoadAll: (statusKey: number) => void
	filterStatus: HomeworkStatus | null
}

function ShowMoreButton({
  statusKey,
  total,
  onLoadAll,
}: {
  statusKey: HomeworkStatus
  total: number
  onLoadAll: (k: number) => void
}) {
  return (
    <button
      onClick={() => onLoadAll(STATUS_KEY_MAP[statusKey])}
      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm text-[#9CA3AF] hover:text-[#F2F2F2] transition-colors"
    >
      <ChevronDown size={16} />
      Показать все ({total}+)
    </button>
  )
}

export function HomeworkList({ groupBy, byStatus, bySubject, onLoadAll, filterStatus }: Props) {
	const statusesToShow = filterStatus ? [filterStatus] : STATUS_ORDER
  if (groupBy === "status") {
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
                {group.items.map((hw) => (
                  <HomeworkCard key={hw.id} hw={hw} />
                ))}
              </div>
              {group.hasMore && (
                <ShowMoreButton statusKey={s} total={group.total} onLoadAll={onLoadAll} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(bySubject).map(([subject, statusGroups]) => (
        <div key={subject}>
          <h2 className="text-lg font-bold text-[#F2F2F2] mb-3">{subject}</h2>
          {statusesToShow.map((s) => {
            const group = statusGroups[s]
            if (!group?.items.length) return null
            const { label, icon: Icon, textColor } = STATUS_CONFIG[s]
            return (
              <div key={s} className="mb-4">
                <h3 className="text-sm text-[#9CA3AF] flex items-center gap-1.5 mb-2 ml-1">
                  <Icon size={13} className={textColor} />
                  {label}
                </h3>
                <div className="space-y-3">
                  {group.items.map((hw) => (
                    <HomeworkCard key={hw.id} hw={hw} />
                  ))}
                </div>
                {group.hasMore && (
                  <ShowMoreButton statusKey={s} total={group.total} onLoadAll={onLoadAll} />
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}