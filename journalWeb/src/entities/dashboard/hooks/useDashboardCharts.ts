import { ttl } from '@/shared/config'
import { isCacheValid } from '@/shared/lib'
import { useEffect } from 'react'
import { dashboardApi } from '../api'
import { useDashboardChartsStore } from '../model/store'

export { calcTrend, lastValue, toChartData } from '../utils/chartUtils'

const CACHE_TTL_MS = ttl.ACTIVITY * 1000

let fetchStarted = false

export function useDashboardCharts() {
	const {
		progress,
		attendance,
		status,
		loadedAt,
		setProgress,
		setAttendance,
		setStatus,
		setLoadedAt,
	} = useDashboardChartsStore()

	useEffect(() => {
		if (fetchStarted) return
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return

		fetchStarted = true
		setStatus('loading')

		Promise.all([
			dashboardApi.getProgressChart(),
			dashboardApi.getAttendanceChart(),
		])
			.then(([progress, attendance]) => {
				setProgress(progress)
				setAttendance(attendance)
				setLoadedAt(Date.now())
				setStatus('success')
			})
			.catch(() => {
				fetchStarted = false
				setStatus('error')
			})
	}, [loadedAt])

	return { progress, attendance, status }
}
