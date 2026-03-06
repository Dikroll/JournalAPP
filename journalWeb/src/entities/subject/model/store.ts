import { create } from "zustand"
import type { Subject } from "./types"

interface SubjectState {
  subjects: Subject[]
  status: "idle" | "loading" | "success" | "error"
  loadedAt: number | null

  setSubjects: (subjects: Subject[]) => void
  setStatus: (s: SubjectState["status"]) => void
  setLoadedAt: (t: number) => void
}

export const useSubjectStore = create<SubjectState>()((set) => ({
  subjects: [],
  status: "idle",
  loadedAt: null,

  setSubjects: (subjects) => set({ subjects }),
  setStatus: (status) => set({ status }),
  setLoadedAt: (loadedAt) => set({ loadedAt }),
}))