import { ttl } from '@/shared/config'
import { CACHE_KEYS, storage } from '@/shared/lib'
import { isCacheValid } from '@/shared/lib/isCacheValid'
import { getIsOnline } from '@/shared/model/networkStore'
import { useEffect, useEffectEvent, useRef } from 'react'
import { dashboardApi } from '../api'
import { useDashboardChartsStore } from '../model/store'
import type { DashboardActivityEntry } from '../model/types'

const CACHE_TTL_MS = ttl.ACTIVITY * 1000
const BACKGROUND_REFRESH_MS = 5 * 60 * 1000
const FETCH_TIMEOUT_MS = 25_000

function sortByDateDesc(items: DashboardActivityEntry[]): DashboardActivityEntry[] {
	return [...items].sort((a, b) => b.date.localeCompare(a.date))
}

export function useDashboardActivity() {
	const activity = useDashboardChartsStore(s => s.activity)
	const status = useDashboardChartsStore(s => s.activityStatus)
	const loadedAt = useDashboardChartsStore(s => s.activityLoadedAt)
	const setActivity = useDashboardChartsStore(s => s.setActivity)
	const setStatus = useDashboardChartsStore(s => s.setActivityStatus)
	const setLoadedAt = useDashboardChartsStore(s => s.setActivityLoadedAt)

	const fetchingRef = useRef(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const refreshActivity = useEffectEvent(async () => {
		if (fetchingRef.current) return
		if (!getIsOnline()) {
			if (activity.length === 0) setStatus('error')
			return
		}

		fetchingRef.current = true
		setStatus('loading')

		timeoutRef.current = setTimeout(() => {
			if (!fetchingRef.current) return
			fetchingRef.current = false
			setStatus(activity.length > 0 ? 'success' : 'error')
		}, FETCH_TIMEOUT_MS)

		try {
			const data = sortByDateDesc(await dashboardApi.getActivity())
			setActivity(data)
			setLoadedAt(Date.now())
			setStatus('success')
			storage.set(CACHE_KEYS.DASHBOARD_ACTIVITY, data, ttl.ACTIVITY)
		} catch {
			setStatus(activity.length > 0 ? 'success' : 'error')
		} finally {
			fetchingRef.current = false
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}
		}
	})

	useEffect(() => {
		if (activity.length > 0 && status === 'idle') {
			setStatus('success')
		}
	}, [activity.length, setStatus, status])

	useEffect(() => {
		if (activity.length > 0 || loadedAt !== null) return

		const cached = storage.get<DashboardActivityEntry[]>(CACHE_KEYS.DASHBOARD_ACTIVITY)
		if (!cached?.length) return

		setActivity(sortByDateDesc(cached))
		setLoadedAt(storage.getCachedAt(CACHE_KEYS.DASHBOARD_ACTIVITY) ?? Date.now())
		setStatus('success')
	}, [activity.length, loadedAt, setActivity, setLoadedAt, setStatus])

	useEffect(() => {
		const shouldFetchInitially =
			loadedAt === null || !isCacheValid(loadedAt, CACHE_TTL_MS)

		if (shouldFetchInitially) {
			void refreshActivity()
		}

		const intervalId = window.setInterval(() => {
			void refreshActivity()
		}, BACKGROUND_REFRESH_MS)

		return () => {
			window.clearInterval(intervalId)
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}
		}
	}, [loadedAt])

	return {
		activity,
		status,
		isRefreshing: fetchingRef.current || status === 'loading',
		refreshActivity,
	}
}
