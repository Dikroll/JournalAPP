import { create } from "zustand"
import type { ChartPoint } from "./types"

interface DashboardChartsState {
  progress: ChartPoint[]
  attendance: ChartPoint[]
  status: "idle" | "loading" | "success" | "error"
  setProgress: (data: ChartPoint[]) => void
  setAttendance: (data: ChartPoint[]) => void
  setStatus: (s: "idle" | "loading" | "success" | "error") => void
}

export const useDashboardChartsStore = create<DashboardChartsState>()((set) => ({
  progress: [],
  attendance: [],
  status: "idle",
  setProgress: (progress) => set({ progress }),
  setAttendance: (attendance) => set({ attendance }),
  setStatus: (status) => set({ status }),
}))