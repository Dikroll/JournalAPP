import type { LoadingState } from "@/shared/types"
import { create } from "zustand"
import type { HomeworkCounters, HomeworkItem } from "./types"

// Сколько карточек показываем до кнопки «Показать все»
export const PREVIEW_SIZE = 6

interface HomeworkState {
  items: Record<number, HomeworkItem[]>  // ключ — status (0,1,2,3,5)
  expandedStatuses: Set<number>          // статусы, для которых показан полный список
  counters: HomeworkCounters | null
  status: LoadingState
  error: string | null

  setItems: (statusKey: number, items: HomeworkItem[]) => void
  setExpanded: (statusKey: number, expanded: boolean) => void
  setCounters: (counters: HomeworkCounters) => void
  setStatus: (s: LoadingState) => void
  setError: (e: string | null) => void
  reset: () => void
}

export const useHomeworkStore = create<HomeworkState>()((set) => ({
  items: {},
  expandedStatuses: new Set(),
  counters: null,
  status: "idle",
  error: null,

  setItems: (statusKey, items) =>
    set((state) => ({ items: { ...state.items, [statusKey]: items } })),

  setExpanded: (statusKey, expanded) =>
    set((state) => {
      const next = new Set(state.expandedStatuses)
      expanded ? next.add(statusKey) : next.delete(statusKey)
      return { expandedStatuses: next }
    }),

  setCounters: (counters) => set({ counters }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),

  reset: () =>
    set({
      items: {},
      expandedStatuses: new Set(),
      counters: null,
      status: "idle",
      error: null,
    }),
}))