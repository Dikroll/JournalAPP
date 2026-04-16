import { ttl } from '@/shared/config/cacheConfig'
import { isCacheValid } from '@/shared/lib/isCacheValid'
import { getIsOnline } from '@/shared/model/networkStore'
import { useEffect, useRef } from 'react'
import { scheduleApi } from '../api'
import { useScheduleStore } from '../model/store'

const CACHE_TTL_MS = ttl.SCHEDULE * 1000

const FETCH_TIMEOUT_MS = 15_000

export function resetScheduleTodayFetch() {}

export function useScheduleToday() {
	const today = useScheduleStore(s => s.today)
	const todayStatus = useScheduleStore(s => s.todayStatus)
	const todayLoadedAt = useScheduleStore(s => s.todayLoadedAt)
	const error = useScheduleStore(s => s.error)
	const setToday = useScheduleStore(s => s.setToday)
	const setTodayStatus = useScheduleStore(s => s.setTodayStatus)
	const setTodayLoadedAt = useScheduleStore(s => s.setTodayLoadedAt)
	const setError = useScheduleStore(s => s.setError)

	const fetchingRef = useRef(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (fetchingRef.current) return
		if (isCacheValid(todayLoadedAt, CACHE_TTL_MS)) {
			if (todayStatus === 'idle') setTodayStatus('success')
			return
		}

		if (!getIsOnline()) {
			if (todayLoadedAt !== null) {
				if (todayStatus === 'idle') setTodayStatus('success')
				return
			}
			setTodayStatus('error')
			setError('Нет подключения к интернету')
			return
		}

		fetchingRef.current = true
		setTodayStatus('loading')

		timeoutRef.current = setTimeout(() => {
			if (fetchingRef.current) {
				fetchingRef.current = false
				setTodayStatus('error')
				setError('Превышено время ожидания')
			}
		}, FETCH_TIMEOUT_MS)

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
				if (today.length === 0) setTodayStatus('error')
			})
			.finally(() => {
				fetchingRef.current = false
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
					timeoutRef.current = null
				}
			})
	}, [todayLoadedAt])

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	return { today, status: todayStatus, error }
}
