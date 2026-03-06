import { STATUS_CONFIG } from "@/entities/homework/config"
import { useHomeworkBySubject } from "@/entities/homework/hooks/useHomeworkBySubject"
import type { HomeworkStatus } from "@/entities/homework/model/homeworkStatus"
import { STATUS_KEY_MAP, STATUS_MAP, STATUS_ORDER } from "@/entities/homework/model/homeworkStatus"
import { PREVIEW_SIZE } from "@/entities/homework/model/store"
import { ChevronDown, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { HomeworkCard } from "./HomeworkCard"

interface Props {
  filterStatus: HomeworkStatus | null
}

export function HomeworkSubjectList({ filterStatus }: Props) {
  const { subjects, knownSpecs, loadSubject, loadMoreForSubject } = useHomeworkBySubject()
  const statusesToShow = filterStatus ? [filterStatus] : STATUS_ORDER


  useEffect(() => {
    knownSpecs.forEach(({ specId, specName }) => {
      loadSubject(specId, specName)
    })
  }, [knownSpecs])

  if (knownSpecs.length === 0) {
    return <p className="text-[#9CA3AF] text-sm">Нет данных по предметам</p>
  }

  return (
    <div className="space-y-6">
      {knownSpecs.map(({ specId, specName }) => {
        const subjectData = subjects[specId]
        const isLoading = !subjectData || subjectData.status === "loading"

        return (
          <div key={specId}>
            <h2 className="text-lg font-bold text-[#F2F2F2] mb-3 flex items-center gap-2">
              {specName}
              {isLoading && <Loader2 size={14} className="text-[#9CA3AF] animate-spin" />}
            </h2>

            {isLoading ? (
              <div className="space-y-2">
                {[0, 1].map((i) => (
                  <div key={i} className="bg-white/5 rounded-[20px] h-24 animate-pulse" />
                ))}
              </div>
            ) : (
              statusesToShow.map((s) => {
                const numKey = STATUS_KEY_MAP[s]
                const allItems = (subjectData.items[numKey] ?? []).map((hw) => ({
                  ...hw,
                  statusKey: STATUS_MAP[numKey] ?? s,
                }))

                if (allItems.length === 0) return null

                const isExpanded = subjectData.expandedStatuses.has(numKey)
                const countersValue = subjectData.counters?.[s] ?? allItems.length
                const loadedCount = allItems.length
                const hasMore = !isExpanded && loadedCount < countersValue
                const visibleItems = loadedCount > PREVIEW_SIZE ? allItems : allItems.slice(0, PREVIEW_SIZE)

                const { label, icon: Icon, textColor } = STATUS_CONFIG[s]

                return (
                  <div key={s} className="mb-4">
                    <h3 className="text-sm text-[#9CA3AF] flex items-center gap-1.5 mb-2 ml-1">
                      <Icon size={13} className={textColor} />
                      {label}
                      <span className="text-xs">
                        ({countersValue}{hasMore ? "+" : ""})
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {visibleItems.map((hw) => (
                        <HomeworkCard key={hw.id} hw={hw as any} />
                      ))}
                    </div>
                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => loadMoreForSubject(specId, numKey)}
                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm text-[#9CA3AF] hover:text-[#F2F2F2] transition-colors"
                      >
                        <ChevronDown size={16} />
                        Показать ещё ({countersValue - loadedCount}+)
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )
      })}
    </div>
  )
}