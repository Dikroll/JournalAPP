import { ttl } from '@/shared/config'
import { isCacheValid } from '@/shared/lib'
import { getIsOnline } from '@/shared/model/networkStore'
import { useEffect, useRef } from 'react'
import { scheduleApi } from '../api'
import { useScheduleStore } from '../model/store'
import type { LessonItem } from '../model/types'

const CACHE_TTL_MS = ttl.SCHEDULE * 1000

const EMPTY_LESSONS: LessonItem[] = []

export function useScheduleByDate(date: string | null) {
	const lessons = useScheduleStore(s =>
		date ? (s.days[date] ?? EMPTY_LESSONS) : EMPTY_LESSONS,
	)
	const status = useScheduleStore(s =>
		date ? (s.dayStatus[date] ?? 'idle') : 'idle',
	)
	const dayLoadedAt = useScheduleStore(s =>
		date ? (s.dayLoadedAt[date] ?? null) : null,
	)
	const setDay = useScheduleStore(s => s.setDay)
	const setDayStatus = useScheduleStore(s => s.setDayStatus)
	const setDayLoadedAt = useScheduleStore(s => s.setDayLoadedAt)

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (!date) return
		if (fetchingRef.current) return
		if (isCacheValid(dayLoadedAt, CACHE_TTL_MS)) {
			if (status === 'idle') setDayStatus(date, 'success')
			return
		}

		if (!getIsOnline()) {
			if (dayLoadedAt !== null) {
				if (status === 'idle') setDayStatus(date, 'success')
				return
			}
			setDayStatus(date, 'error')
			return
		}

		fetchingRef.current = true
		setDayStatus(date, 'loading')

		scheduleApi
			.getByDate(date)
			.then(data => {
				setDay(date, data)
				setDayLoadedAt(date, Date.now())
				setDayStatus(date, 'success')
			})
			.catch(() => {
				if (lessons.length === 0) setDayStatus(date, 'error')
			})
			.finally(() => {
				fetchingRef.current = false
			})
	}, [date, dayLoadedAt])

	return { lessons, status }
}
