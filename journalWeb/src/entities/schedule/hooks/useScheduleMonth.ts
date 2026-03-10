import { ttl } from '@/shared/config'
import { isCacheValid } from '@/shared/lib'
import { useEffect, useRef } from 'react'
import { scheduleApi } from '../api'
import { useScheduleStore } from '../model/store'

const CACHE_TTL_MS = ttl.SCHEDULE * 1000

export function useScheduleMonth(date: string) {
	const lessons = useScheduleStore(s => s.months[date] ?? [])
	const status = useScheduleStore(s => s.monthStatus[date] ?? 'idle')
	const monthLoadedAt = useScheduleStore(s => s.monthLoadedAt[date] ?? null)
	const setMonth = useScheduleStore(s => s.setMonth)
	const setMonthStatus = useScheduleStore(s => s.setMonthStatus)
	const setMonthLoadedAt = useScheduleStore(s => s.setMonthLoadedAt)

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (!date) return
		if (fetchingRef.current) return
		if (isCacheValid(monthLoadedAt, CACHE_TTL_MS)) return

		fetchingRef.current = true
		setMonthStatus(date, 'loading')

		scheduleApi
			.getMonth(date)
			.then(data => {
				setMonth(date, data)
				setMonthLoadedAt(date, Date.now())
				setMonthStatus(date, 'success')
			})
			.catch(() => {
				setMonthStatus(date, 'error')
			})
			.finally(() => {
				fetchingRef.current = false
			})
	}, [date, monthLoadedAt])

	return { lessons, status }
}
