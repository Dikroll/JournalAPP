import { ttl } from '@/shared/config/cacheConfig'
import { isCacheValid } from '@/shared/lib/isCacheValid'
import { useEffect } from 'react'
import { scheduleApi } from '../api'
import { useScheduleStore } from '../model/store'

const CACHE_TTL_MS = ttl.SCHEDULE * 1000

let fetching = false

export function resetScheduleTodayFetch() {
	fetching = false
}

export function useScheduleToday() {
	const today = useScheduleStore(s => s.today)
	const todayStatus = useScheduleStore(s => s.todayStatus)
	const todayLoadedAt = useScheduleStore(s => s.todayLoadedAt)
	const error = useScheduleStore(s => s.error)
	const setToday = useScheduleStore(s => s.setToday)
	const setTodayStatus = useScheduleStore(s => s.setTodayStatus)
	const setTodayLoadedAt = useScheduleStore(s => s.setTodayLoadedAt)
	const setError = useScheduleStore(s => s.setError)

	useEffect(() => {
		if (fetching) return
		if (isCacheValid(todayLoadedAt, CACHE_TTL_MS)) return

		fetching = true
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
				fetching = false
			})
	}, [todayLoadedAt])

	return { today, status: todayStatus, error }
}
