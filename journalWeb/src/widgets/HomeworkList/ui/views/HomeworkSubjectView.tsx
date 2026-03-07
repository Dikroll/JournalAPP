import { STATUS_CONFIG } from "@/entities/homework/config"
import type { GroupData, HomeworkItemWithStatus } from "@/entities/homework/hooks/useHomeworkGroups"
import type { HomeworkStatus } from "@/entities/homework/model/homeworkStatus"
import { STATUS_KEY_MAP, STATUS_ORDER } from "@/entities/homework/model/homeworkStatus"
import type { SubjectData } from "@/entities/homework/model/store"
import type { Subject } from "@/entities/subject/model/types"
import { HomeworkCard } from "@/widgets/HomeworkList/ui/card/HomeworkCard"
import { ChevronDown, RefreshCw } from "lucide-react"

interface Props {
  bySubject: Record<string, Record<HomeworkStatus, GroupData>>
  filterStatus: HomeworkStatus | null
  selectedSpec: Subject | null
  specList: Subject[]
  subjects: Record<number, SubjectData>
  onLoadSubject: (specId: number, specName: string) => void
  onLoadMoreForSubject: (specId: number, statusKey: number) => void
}

export function HomeworkSubjectView({
  bySubject,
  filterStatus,
  selectedSpec,
  specList,
  subjects,
  onLoadSubject,
  onLoadMoreForSubject,
}: Props) {
  const statusesToShow = filterStatus ? [filterStatus] : STATUS_ORDER

  const specNames = selectedSpec
    ? Object.keys(bySubject).filter((n) => n === selectedSpec.name)
    : Object.keys(bySubject).sort((a, b) => a.localeCompare(b, "ru"))

  if (!specNames.length) {
    return <p className="text-[#9CA3AF] text-sm">Нет данных по предметам</p>
  }

  return (
    <div className="space-y-8">
      {specNames.map((specName) => {
        const statusGroups = bySubject[specName]
        const knownSpec = specList.find((s) => s.name === specName)
        const specId = knownSpec?.id ?? null
        const subjectData = specId != null ? subjects[specId] : null
        const isLoadingSubject = subjectData?.status === "loading"

        const hasAny = statusesToShow.some((s) => (statusGroups[s]?.items.length ?? 0) > 0)
        if (!hasAny) return null

        return (
          <div key={specName}>
            <h2 className="text-base font-bold text-[#F2F2F2] mb-3">{specName}</h2>

            {statusesToShow.map((s) => {
              const numKey = STATUS_KEY_MAP[s]
              const storeItems = subjectData?.items[numKey] ?? []
              const baseItems = statusGroups[s]?.items ?? []

              const displayItems: HomeworkItemWithStatus[] =
                storeItems.length > 0
                  ? storeItems.map((hw) => ({ ...hw, statusKey: s }))
                  : baseItems

              if (!displayItems.length) return null

              const storeTotal = subjectData?.counters?.[s] ?? null
              const total = storeTotal ?? displayItems.length
              const isExpanded = subjectData?.expandedStatuses.has(numKey) ?? false
              const subjectNotFetched = subjectData == null || subjectData.loadedAt == null
              const hasMore = subjectNotFetched || (!isExpanded && displayItems.length < total)
              const { label, icon: Icon, textColor } = STATUS_CONFIG[s]

              return (
                <div key={s} className="mb-4">
                  <h3 className="text-sm text-[#9CA3AF] flex items-center gap-1.5 mb-2">
                    <Icon size={13} className={textColor} />
                    {label}
                    <span className="text-xs">({total}{hasMore ? "+" : ""})</span>
                  </h3>
                  <div className="space-y-3">
                    {displayItems.map((hw) => (
                      <HomeworkCard key={hw.id} hw={hw as any} />
                    ))}
                  </div>
                  {hasMore && specId != null && (
                    <button
                      type="button"
                      disabled={isLoadingSubject}
                      onClick={() =>
                        subjectNotFetched
                          ? onLoadSubject(specId, specName)
                          : onLoadMoreForSubject(specId, numKey)
                      }
                      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm text-[#9CA3AF] hover:text-[#F2F2F2] transition-colors disabled:opacity-50"
                    >
                      {isLoadingSubject ? (
                        <><RefreshCw size={14} className="animate-spin" /> Загрузка...</>
                      ) : subjectNotFetched ? (
                        <><ChevronDown size={16} /> Показать все ДЗ по предмету</>
                      ) : (
                        <><ChevronDown size={16} /> Показать ещё ({total - displayItems.length}+)</>
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}