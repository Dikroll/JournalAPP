import { useScheduleStore } from '@/entities/schedule'
import { useCallback } from 'react'

export function useRefreshSchedule() {
	const clearMonthsCache = useScheduleStore(s => s.clearMonthsCache)
	const clearWeeksCache = useScheduleStore(s => s.clearWeeksCache)
	const monthStatus = useScheduleStore(s => s.monthStatus)
	const weekStatus = useScheduleStore(s => s.weekStatus)

	const isRefreshing =
		Object.values(monthStatus).some(s => s === 'loading') ||
		Object.values(weekStatus).some(s => s === 'loading')

	const refresh = useCallback(() => {
		clearMonthsCache()
		clearWeeksCache()
	}, [clearMonthsCache, clearWeeksCache])

	return { refresh, isRefreshing }
}
