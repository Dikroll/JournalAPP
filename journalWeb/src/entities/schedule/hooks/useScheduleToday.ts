import { ttl } from '@/shared/config/cacheConfig'
import { isCacheValid } from '@/shared/lib/isCacheValid'
import { useEffect, useRef } from 'react'
import { scheduleApi } from '../api'
import { useScheduleStore } from '../model/store'

const CACHE_TTL_MS = ttl.SCHEDULE * 1000

export function useScheduleToday() {
	const {
		today,
		todayStatus,
		todayLoadedAt,
		error,
		setToday,
		setTodayStatus,
		setTodayLoadedAt,
		setError,
	} = useScheduleStore()

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (fetchingRef.current) return
		if (isCacheValid(todayLoadedAt, CACHE_TTL_MS)) return

		fetchingRef.current = true
		setTodayStatus('loading')

		scheduleApi
			.getToday()
			.then(data => {
				setToday(data)
				setTodayLoadedAt(Date.now())
				setTodayStatus('success')
			})
			.catch(err => {
				const msg =
					(err as { response?: { data?: { detail?: string } } })?.response?.data
						?.detail ?? 'Ошибка загрузки расписания'
				setError(msg)
				setTodayStatus('error')
			})
			.finally(() => {
				fetchingRef.current = false
			})
	}, [todayLoadedAt])

	return { today, status: todayStatus, error }
}
