import { ttl } from '@/shared/config'
import { isCacheValid } from '@/shared/lib'
import { useEffect, useRef } from 'react'
import { dashboardApi } from '../api'
import { useDashboardChartsStore } from '../model/store'

export { calcTrend, lastValue, toChartData } from '../utils/chartUtils'

const CACHE_TTL_MS = ttl.ACTIVITY * 1000
const FETCH_TIMEOUT_MS = 15_000

export let fetchStarted = false
export function resetFetchStarted() {
	fetchStarted = false
}

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

	const fetchingRef = useRef(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (fetchingRef.current) return
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return

		fetchingRef.current = true
		setStatus('loading')

		timeoutRef.current = setTimeout(() => {
			if (fetchingRef.current) {
				fetchingRef.current = false
				setStatus('error')
			}
		}, FETCH_TIMEOUT_MS)

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
				setStatus('error')
			})
			.finally(() => {
				fetchingRef.current = false
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
					timeoutRef.current = null
				}
			})
	}, [loadedAt])

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	return { progress, attendance, status }
}
