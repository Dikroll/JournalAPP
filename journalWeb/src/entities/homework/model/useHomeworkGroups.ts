import { useMemo } from "react"
import { PREVIEW_SIZE } from "./store"
import type { HomeworkCounters, HomeworkItem } from "./types"

export type HomeworkStatus = "overdue" | "new" | "pending" | "checked" | "returned"

export const STATUS_MAP: Record<number, HomeworkStatus> = {
  0: "overdue", 1: "checked", 2: "pending", 3: "new", 5: "returned",
}

export const STATUS_KEY_MAP: Record<HomeworkStatus, number> = {
  overdue: 0, checked: 1, pending: 2, new: 3, returned: 5,
}

export const STATUS_ORDER: HomeworkStatus[] = [
  "overdue", "new", "pending", "checked", "returned",
]

export type HomeworkItemWithStatus = HomeworkItem & { statusKey: HomeworkStatus }

export type GroupData = {
  items: HomeworkItemWithStatus[]
  total: number
  hasMore: boolean
  isExpanded: boolean
}

export function useHomeworkGroups(
  items: Record<number, HomeworkItem[]>,
  expandedStatuses: Set<number>,
  counters: HomeworkCounters | null,  
) {
  const flat = useMemo(() => {
    return Object.entries(items).flatMap(([statusNum, list]) => {
      const statusKey = STATUS_MAP[Number(statusNum)] ?? "pending"
      return list.map((hw) => ({ ...hw, statusKey }))
    })
  }, [items])

  const byStatus = useMemo(() => {
  return STATUS_ORDER.reduce((acc, s) => {
    const numKey = STATUS_KEY_MAP[s]
    const all = flat.filter((hw) => hw.statusKey === s)
    const isExpanded = expandedStatuses.has(numKey)
    const loadedCount = all.length
    const realTotal = counters ? counters[s] : loadedCount
    acc[s] = {
      items: isExpanded ? all : all.slice(0, PREVIEW_SIZE),
      total: realTotal,
      isExpanded,
      hasMore: !isExpanded && loadedCount < realTotal,
    }
    return acc
  }, {} as Record<HomeworkStatus, GroupData>)
}, [flat, expandedStatuses, counters])



  const bySubject = useMemo(() => {
    const raw: Record<string, Partial<Record<HomeworkStatus, HomeworkItemWithStatus[]>>> = {}
    for (const hw of flat) {
      if (!raw[hw.spec_name]) raw[hw.spec_name] = {}
      if (!raw[hw.spec_name][hw.statusKey]) raw[hw.spec_name][hw.statusKey] = []
      raw[hw.spec_name][hw.statusKey]!.push(hw)
    }

    const result: Record<string, Record<HomeworkStatus, GroupData>> = {}
    for (const subject of Object.keys(raw)) {
      result[subject] = {} as Record<HomeworkStatus, GroupData>
      for (const s of STATUS_ORDER) {
        const all = raw[subject][s] ?? []
        const numKey = STATUS_KEY_MAP[s]
        const isExpanded = expandedStatuses.has(numKey)
        const realTotal = counters ? counters[s] : all.length
        result[subject][s] = {
          items: isExpanded ? all : all.slice(0, PREVIEW_SIZE),
          total: all.length,  
          isExpanded,
          hasMore: !isExpanded && realTotal > PREVIEW_SIZE, 
        }
      }
    }
    return result
  }, [flat, expandedStatuses, counters])

  return { flat, byStatus, bySubject }
}