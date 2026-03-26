import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import type { ChartPoint } from './types'

interface DashboardChartsState {
	progress: ChartPoint[]
	attendance: ChartPoint[]
	status: LoadingState
	loadedAt: number | null
	setProgress: (data: ChartPoint[]) => void
	setAttendance: (data: ChartPoint[]) => void
	setStatus: (s: LoadingState) => void
	setLoadedAt: (t: number) => void
}

export const useDashboardChartsStore = create<DashboardChartsState>()(set => ({
	progress: [],
	attendance: [],
	status: 'idle',
	loadedAt: null,
	setProgress: progress => set({ progress }),
	setAttendance: attendance => set({ attendance }),
	setStatus: status => set({ status }),
	setLoadedAt: loadedAt => set({ loadedAt }),
}))
