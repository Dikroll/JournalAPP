import { ttl } from '@/shared/config'
import { CACHE_KEYS } from '@/shared/lib'
import { storage } from '@/shared/lib/encryptedStorage'
import { isCacheValid } from '@/shared/lib/isCacheValid'
import { getIsOnline } from '@/shared/model/networkStore'
import { useCallback, useEffect, useRef } from 'react'
import { dashboardApi } from '../api'
import { useDashboardChartsStore } from '../model/store'
import type { DashboardActivityEntry } from '../model/types'
//dashboard activity is not critical data, so we can afford to have a longer cache TTL and no aggressive revalidation strategy. This helps reduce server load and improve perceived performance for users who may not need real-time updates on their dashboard activity.
const CACHE_TTL_MS = ttl.ACTIVITY * 1000
const FETCH_TIMEOUT_MS = 25_000

function sortByDateDesc(
	items: DashboardActivityEntry[],
): DashboardActivityEntry[] {
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

	const hydrateFromStorage = useCallback(() => {
		const cached = storage.get<DashboardActivityEntry[]>(
			CACHE_KEYS.DASHBOARD_ACTIVITY,
		)
		if (!cached?.length) return false

		setActivity(sortByDateDesc(cached))
		setLoadedAt(
			storage.getCachedAt(CACHE_KEYS.DASHBOARD_ACTIVITY) ?? Date.now(),
		)
		setStatus('success')
		return true
	}, [setActivity, setLoadedAt, setStatus])

	const refreshActivityRef = useRef(async () => {})
	refreshActivityRef.current = async () => {
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
	}

	const refreshActivity = useCallback(async () => {
		await refreshActivityRef.current()
	}, [])

	useEffect(() => {
		if (activity.length > 0 && status === 'idle') {
			setStatus('success')
		}
	}, [activity.length, setStatus, status])

	useEffect(() => {
		if (activity.length > 0 || loadedAt !== null) return
		hydrateFromStorage()
	}, [activity.length, hydrateFromStorage, loadedAt])

	useEffect(() => {
		if (activity.length === 0 && loadedAt === null && hydrateFromStorage()) {
			return
		}

		const shouldFetchInitially =
			loadedAt === null || !isCacheValid(loadedAt, CACHE_TTL_MS)

		if (shouldFetchInitially) {
			void refreshActivity()
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
				timeoutRef.current = null
			}
		}
	}, [activity.length, hydrateFromStorage, loadedAt, refreshActivity])

	return {
		activity,
		status,
		isRefreshing: fetchingRef.current || status === 'loading',
		refreshActivity,
	}
}
