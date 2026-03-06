import type { LoadingState } from "@/shared/types"
import { create } from "zustand"
import type { GradeEntry } from "./types"

interface GradesState {
  entries: GradeEntry[]
  status: LoadingState
  error: string | null
  loadedAt: number | null

  bySubject: Record<number, {
    entries: GradeEntry[]
    status: LoadingState
    loadedAt: number | null
  }>

  setEntries: (entries: GradeEntry[]) => void
  setStatus: (s: LoadingState) => void
  setError: (e: string | null) => void
  setLoadedAt: (t: number) => void

  setSubjectEntries: (specId: number, entries: GradeEntry[]) => void
  setSubjectStatus: (specId: number, status: LoadingState) => void

  reset: () => void
}

export const useGradesStore = create<GradesState>()((set) => ({
  entries: [],
  status: "idle",
  error: null,
  loadedAt: null,
  bySubject: {},

  setEntries: (entries) => set({ entries }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setLoadedAt: (loadedAt) => set({ loadedAt }),

  setSubjectEntries: (specId, entries) =>
    set((state) => ({
      bySubject: {
        ...state.bySubject,
        [specId]: { entries, status: "success", loadedAt: Date.now() },
      },
    })),

  setSubjectStatus: (specId, status) =>
    set((state) => ({
      bySubject: {
        ...state.bySubject,
        [specId]: { ...(state.bySubject[specId] ?? { entries: [], loadedAt: null }), status },
      },
    })),

  reset: () => set({ entries: [], status: "idle", error: null, loadedAt: null, bySubject: {} }),
}))
