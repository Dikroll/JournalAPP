import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import type { ChartPoint, DashboardActivityEntry } from '../model/types'

export const dashboardApi = {
	getProgressChart: () =>
		api.get<ChartPoint[]>(apiConfig.DASHBOARD_CHART_PROGRESS).then(r => r.data),

	getAttendanceChart: () =>
		api
			.get<ChartPoint[]>(apiConfig.DASHBOARD_CHART_ATTENDANCE)
			.then(r => r.data),

	getActivity: () =>
		api
			.get<DashboardActivityEntry[]>(apiConfig.DASHBOARD_ACTIVITY)
			.then(r => r.data),
}
