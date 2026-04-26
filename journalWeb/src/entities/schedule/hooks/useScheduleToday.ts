import { getIsOnline } from '@/shared/model/networkStore'
import { useEffect, useRef } from 'react'
import { scheduleApi } from '../api'
import type { LessonItem } from '../model/types'
import { useScheduleStore } from '../model/store'

const FETCH_TIMEOUT_MS = 15_000

let inFlightPromise: Promise<LessonItem[]> | null = null

function fetchTodayDeduped(): Promise<LessonItem[]> {
	if (inFlightPromise) return inFlightPromise
	inFlightPromise = scheduleApi.getToday().finally(() => {
		inFlightPromise = null
	})
	return inFlightPromise
}

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
	const hasFetchedRef = useRef(false)

	useEffect(() => {
		if (todayLoadedAt === null) hasFetchedRef.current = false
		if (fetchingRef.current) return

		if (!getIsOnline()) {
			if (todayLoadedAt !== null) {
				if (todayStatus === 'idle') setTodayStatus('success')
				return
			}
			setTodayStatus('error')
			setError('Нет подключения к интернету')
			return
		}

		if (hasFetchedRef.current) return
		hasFetchedRef.current = true

		fetchingRef.current = true
		if (today.length === 0) setTodayStatus('loading')

		timeoutRef.current = setTimeout(() => {
			if (fetchingRef.current) {
				fetchingRef.current = false
				if (today.length === 0) {
					setTodayStatus('error')
					setError('Превышено время ожидания')
				}
			}
		}, FETCH_TIMEOUT_MS)

		fetchTodayDeduped()
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
