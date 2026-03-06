import { useHomework } from "@/entities/homework/hooks/useHomework"
import { useHomeworkBySubject } from "@/entities/homework/hooks/useHomeworkBySubject"
import { useHomeworkGroups } from "@/entities/homework/hooks/useHomeworkGroups"
import { STATUS_CONFIG } from "@/entities/homework/config"
import { STATUS_KEY_MAP, STATUS_ORDER } from "@/entities/homework/model/homeworkStatus"

import { useSubjects } from "@/entities/subject/hooks/useSubjects"
import type { Subject } from "@/entities/subject/model/types"
import { SpecSelector } from "@/shared/components/ui/SpecSelector"
import { HomeworkCountersBar } from "@/widgets"
import { HomeworkCard } from "@/widgets/HomeworkList/ui/HomeworkCard"
import { ChevronDown, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import type { HomeworkItemWithStatus } from "@/entities/homework/hooks/useHomeworkGroups"

export function HomeworkPage() {
  const [groupBy, setGroupBy] = useState<"status" | "subject">("status")
  const [selectedSpec, setSelectedSpec] = useState<Subject | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { subjects: specList, status: specsStatus } = useSubjects()

  const {
    items, expandedStatuses, counters, status, error,
    filterStatus, refresh, loadMore, setFilter,
  } = useHomework()

  const { byStatus, bySubject } = useHomeworkGroups(items, expandedStatuses, counters)
  const { subjects, loadSubject, loadMoreForSubject } = useHomeworkBySubject()

  useEffect(() => {
    if (!selectedSpec) return
    loadSubject(selectedSpec.id, selectedSpec.name)
  }, [selectedSpec?.id])

  const handleRefresh = () => {
    setIsRefreshing(true)
    refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const statusesToShow = filterStatus ? [filterStatus] : STATUS_ORDER

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#9CA3AF]">Загрузка...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-[#DC2626]">{error}</p>
        <button type="button" onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-2xl text-[#F2F2F2] text-sm border border-white/20 transition-colors">
          <RefreshCw size={16} /> Повторить
        </button>
      </div>
    )
  }

  // ─── Рендер группы по статусу
  const renderStatusMode = () => {
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
                  <button type="button"
                    onClick={() => loadMore(STATUS_KEY_MAP[s])}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm text-[#9CA3AF] hover:text-[#F2F2F2] transition-colors">
                    <ChevronDown size={16} />
                    Показать ещё ({group.total - group.items.length}+)
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )
    }

    const subjectData = subjects[selectedSpec.id]
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

          const displayItems: HomeworkItemWithStatus[] = storeItems.map((hw) => ({
            ...hw, statusKey: s,
          }))
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
                <button type="button"
                  onClick={() => loadMoreForSubject(selectedSpec.id, numKey)}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm text-[#9CA3AF] hover:text-[#F2F2F2] transition-colors">
                  <ChevronDown size={16} />
                  Показать ещё ({total - displayItems.length}+)
                </button>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ─── Рендер группы по предмету
  const renderSubjectMode = () => {
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
            <div key={specName} data-spec={specName}>
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
                      <span className="text-xs">
                        ({total}{hasMore ? "+" : ""})
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {displayItems.map((hw) => <HomeworkCard key={hw.id} hw={hw as any} />)}
                    </div>
                    {hasMore && specId != null && (
                      <button
                        type="button"
                        disabled={isLoadingSubject}
                        onClick={() => {
                          if (subjectNotFetched) {

                            loadSubject(specId, specName)
                          } else {
        
                            loadMoreForSubject(specId, numKey)
                          }
                        }}
                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm text-[#9CA3AF] hover:text-[#F2F2F2] transition-colors disabled:opacity-50"
                      >
                        {isLoadingSubject
                          ? <><RefreshCw size={14} className="animate-spin" /> Загрузка...</>
                          : subjectNotFetched
                            ? <><ChevronDown size={16} /> Показать все ДЗ по предмету</>
                            : <><ChevronDown size={16} /> Показать ещё ({total - displayItems.length}+)</>
                        }
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

  return (
    <div className="min-h-screen text-[#F2F2F2] pb-28">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Домашние задания</h1>
          <button type="button" onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-2xl text-[#9CA3AF] hover:text-[#F2F2F2] text-sm border border-white/10 transition-colors">
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
            Обновить
          </button>
        </div>

        {counters && (
          <HomeworkCountersBar counters={counters} activeFilter={filterStatus} onFilter={setFilter} />
        )}

        
        <div className="flex gap-2">
          {(["status", "subject"] as const).map((mode) => (
            <button key={mode} type="button" onClick={() => setGroupBy(mode)}
              className={`flex-1 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                groupBy === mode ? "bg-[#0570f2] text-white" : "bg-white/5 text-[#F2F2F2] border border-white/10"
              }`}>
              {mode === "status" ? "По статусу" : "По предметам"}
            </button>
          ))}
        </div>

        
        <SpecSelector
          subjects={specList}
          selectedId={selectedSpec?.id ?? null}
          onChange={setSelectedSpec}
          loading={specsStatus === "loading"}
        />
      </div>

      <div className="px-4">
        {groupBy === "status" ? renderStatusMode() : renderSubjectMode()}
      </div>
    </div>
  )
}