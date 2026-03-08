import { useHomework, useHomeworkBySubject, useHomeworkGroups } from '@/entities/homework'
import { useSubjects } from "@/entities/subject/hooks/useSubjects"
import type { Subject } from "@/entities/subject/model/types"
import { SpecSelector } from "@/features/selectSpec/ui/SpecSelector"
import { HomeworkCountersBar } from "@/widgets"
import { HomeworkStatusView } from "@/widgets/HomeworkList/ui/views/HomeworkStatusView"
import { HomeworkSubjectView } from "@/widgets/HomeworkList/ui/views/HomeworkSubjectView"
import { RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

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
                groupBy === mode
                  ? "bg-[#0570f2] text-white"
                  : "bg-white/5 text-[#F2F2F2] border border-white/10"
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
        {groupBy === "status" ? (
          <HomeworkStatusView
            byStatus={byStatus}
            filterStatus={filterStatus}
            selectedSpec={selectedSpec}
            subjectData={selectedSpec ? subjects[selectedSpec.id] : undefined}
            onLoadMore={loadMore}
            onLoadMoreForSubject={loadMoreForSubject}
          />
        ) : (
          <HomeworkSubjectView
            bySubject={bySubject}
            filterStatus={filterStatus}
            selectedSpec={selectedSpec}
            specList={specList}
            subjects={subjects}
            onLoadSubject={loadSubject}
            onLoadMoreForSubject={loadMoreForSubject}
          />
        )}
      </div>
    </div>
  )
}