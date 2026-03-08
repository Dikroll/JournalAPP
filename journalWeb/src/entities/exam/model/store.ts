import type { LoadingState } from "@/shared/types"
import { create } from "zustand"
import type { FutureExamItem } from "./types"

interface ExamState {
  exams: FutureExamItem[]
  status: LoadingState
  loadedAt: number | null
  setExams: (exams: FutureExamItem[]) => void
  setStatus: (s: LoadingState) => void
  setLoadedAt: (t: number) => void
}

export const useExamStore = create<ExamState>()((set) => ({
  exams: [],
  status: "idle",
  loadedAt: null,
  setExams: (exams) => set({ exams }),
  setStatus: (status) => set({ status }),
  setLoadedAt: (loadedAt) => set({ loadedAt }),
}))