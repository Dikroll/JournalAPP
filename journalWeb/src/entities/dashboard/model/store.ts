import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChartPoint, DashboardActivityEntry } from './types'

interface DashboardChartsState {
	progress: ChartPoint[]
	attendance: ChartPoint[]
	status: LoadingState
	loadedAt: number | null
	activity: DashboardActivityEntry[]
	activityStatus: LoadingState
	activityLoadedAt: number | null
	setProgress: (data: ChartPoint[]) => void
	setAttendance: (data: ChartPoint[]) => void
	setStatus: (s: LoadingState) => void
	setLoadedAt: (t: number) => void
	setActivity: (data: DashboardActivityEntry[]) => void
	setActivityStatus: (s: LoadingState) => void
	setActivityLoadedAt: (t: number) => void
}

export const useDashboardChartsStore = create<DashboardChartsState>()(
	persist(
		set => ({
			progress: [],
			attendance: [],
			status: 'idle',
			loadedAt: null,
			activity: [],
			activityStatus: 'idle',
			activityLoadedAt: null,
			setProgress: progress => set({ progress }),
			setAttendance: attendance => set({ attendance }),
			setStatus: status => set({ status }),
			setLoadedAt: loadedAt => set({ loadedAt }),
			setActivity: activity => set({ activity }),
			setActivityStatus: activityStatus => set({ activityStatus }),
			setActivityLoadedAt: activityLoadedAt => set({ activityLoadedAt }),
		}),
		{
			name: 'dashboard-store',
			partialize: state => ({
				progress: state.progress,
				attendance: state.attendance,
				loadedAt: state.loadedAt,
				activity: state.activity,
				activityLoadedAt: state.activityLoadedAt,
			}),
		},
	),
)
