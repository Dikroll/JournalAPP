import { useHomework } from "@/entities/homework/model/useHomework"
import { useHomeworkGroups } from "@/entities/homework/model/useHomeworkGroups"
import { HomeworkCountersBar, HomeworkList } from "@/widgets"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

export function HomeworkPage() {
  const [groupBy, setGroupBy] = useState<"status" | "subject">("status")
  const { items, expandedStatuses, counters, status, error, refresh, loadAll } = useHomework()
  const { byStatus, bySubject } = useHomeworkGroups(items, expandedStatuses)

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1F2024]">
        <p className="text-[#9CA3AF]">Загрузка...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1F2024] gap-4">
        <p className="text-[#DC2626]">{error}</p>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-2xl text-[#F2F2F2] text-sm border border-white/20 transition-colors"
        >
          <RefreshCw size={16} />
          Повторить
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1F2024] text-[#F2F2F2] pb-28">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Домашние задания</h1>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-2xl text-[#9CA3AF] hover:text-[#F2F2F2] text-sm border border-white/10 transition-colors"
          >
            <RefreshCw size={15} />
            Обновить
          </button>
        </div>

        {counters && <HomeworkCountersBar counters={counters} />}

        <div className="flex gap-2">
          {(["status", "subject"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setGroupBy(mode)}
              className={`flex-1 px-4 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                groupBy === mode
                  ? "bg-[#F29F05] text-white"
                  : "bg-white/5 text-[#F2F2F2] border border-white/10"
              }`}
            >
              {mode === "status" ? "По статусу" : "По предметам"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4">
        <HomeworkList
          groupBy={groupBy}
          byStatus={byStatus}
          bySubject={bySubject}
          onLoadAll={loadAll}
        />
      </div>
    </div>
  )
}