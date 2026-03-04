import type { LoadingState } from "@/shared/types"
import { create } from "zustand"
import type { HomeworkCounters, HomeworkItem } from "./types"
import type { HomeworkStatus } from "./useHomeworkGroups"

export const PREVIEW_SIZE = 6
export const PAGE_SIZE = 6  

interface HomeworkState {
  items: Record<number, HomeworkItem[]>
  pages: Record<number, number>        
  expandedStatuses: Set<number>
  counters: HomeworkCounters | null
  status: LoadingState
  error: string | null
  filterStatus: HomeworkStatus | null
  loadedAt: number | null              // timestamp последней загрузки

  setItems: (statusKey: number, items: HomeworkItem[]) => void
  appendItems: (statusKey: number, newItems: HomeworkItem[], page: number) => void  
  setExpanded: (statusKey: number, expanded: boolean) => void
  setCounters: (counters: HomeworkCounters) => void
  setStatus: (s: LoadingState) => void
  setError: (e: string | null) => void
  setFilter: (f: HomeworkStatus | null) => void
  setLoadedAt: (t: number) => void
  reset: () => void
}

export const useHomeworkStore = create<HomeworkState>()((set) => ({
  items: {},
  pages: {},           
  expandedStatuses: new Set(),
  counters: null,
  status: "idle",
  error: null,
  filterStatus: null,
  loadedAt: null,

  setItems: (statusKey, items) =>
    set((state) => ({
      items: { ...state.items, [statusKey]: items },
      pages: { ...state.pages, [statusKey]: 1 },  
    })),

  appendItems: (statusKey, newItems, page) =>
  set((state) => ({
    items: {
      ...state.items,
      [statusKey]: [...(state.items[statusKey] ?? []), ...newItems],
    },
    pages: { ...state.pages, [statusKey]: page },
  })),

  setExpanded: (statusKey, expanded) =>
    set((state) => {
      const next = new Set(state.expandedStatuses)
      expanded ? next.add(statusKey) : next.delete(statusKey)
      return { expandedStatuses: next }
    }),

  setCounters: (counters) => set({ counters }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setFilter: (filterStatus) => set({ filterStatus }),
  setLoadedAt: (loadedAt) => set({ loadedAt }),

  reset: () =>
    set({
      items: {},
      pages: {},
      expandedStatuses: new Set(),
      counters: null,
      status: "idle",
      error: null,
      filterStatus: null,
      loadedAt: null,
    }),
}))