import { useScheduleStore } from '@/entities/schedule'
import { useNetworkStore } from '@/shared/model/networkStore'
import { useCallback } from 'react'

export function useRefreshSchedule() {
	const isOnline = useNetworkStore(s => s.isOnline)
	const clearMonthsCache = useScheduleStore(s => s.clearMonthsCache)
	const clearWeeksCache = useScheduleStore(s => s.clearWeeksCache)
	const monthStatus = useScheduleStore(s => s.monthStatus)
	const weekStatus = useScheduleStore(s => s.weekStatus)

	const isRefreshing =
		Object.values(monthStatus).some(s => s === 'loading') ||
		Object.values(weekStatus).some(s => s === 'loading')

	const refresh = useCallback(() => {
		if (!isOnline) return
		clearMonthsCache()
		clearWeeksCache()
	}, [isOnline, clearMonthsCache, clearWeeksCache])

	return { refresh, isRefreshing, isOnline }
}
