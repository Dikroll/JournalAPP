import { ttl } from '@/shared/config'
import { isCacheValid } from '@/shared/lib'
import { getIsOnline } from '@/shared/model/networkStore'
import { useEffect, useRef } from 'react'
import { scheduleApi } from '../api'
import { useScheduleStore } from '../model/store'
import type { LessonItem } from '../model/types'

const CACHE_TTL_MS = ttl.SCHEDULE * 1000

const EMPTY_LESSONS: LessonItem[] = []

export function useScheduleWeek(date: string) {
	const lessons = useScheduleStore(s => s.weeks[date] ?? EMPTY_LESSONS)
	const status = useScheduleStore(s => s.weekStatus[date] ?? 'idle')
	const weekLoadedAt = useScheduleStore(s => s.weekLoadedAt[date] ?? null)
	const setWeek = useScheduleStore(s => s.setWeek)
	const setWeekStatus = useScheduleStore(s => s.setWeekStatus)
	const setWeekLoadedAt = useScheduleStore(s => s.setWeekLoadedAt)

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (!date) return
		if (fetchingRef.current) return
		if (isCacheValid(weekLoadedAt, CACHE_TTL_MS)) return

		if (!getIsOnline()) {
			if (weekLoadedAt !== null) return
			setWeekStatus(date, 'error')
			return
		}

		fetchingRef.current = true
		setWeekStatus(date, 'loading')

		scheduleApi
			.getWeek(date)
			.then(data => {
				setWeek(date, data)
				setWeekLoadedAt(date, Date.now())
				setWeekStatus(date, 'success')
			})
			.catch(() => {
				if (lessons.length === 0) setWeekStatus(date, 'error')
			})
			.finally(() => {
				fetchingRef.current = false
			})
	}, [date, weekLoadedAt])

	return { lessons, status }
}
