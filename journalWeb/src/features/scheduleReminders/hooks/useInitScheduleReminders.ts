import { scheduleApi } from '@/entities/schedule'
import { useScheduleStore } from '@/entities/schedule/model/store'
import { useEffect, useRef } from 'react'
import { useHydrationStore } from '@/shared/model/authStore'
import { useAuthStore } from '@/shared/model'
import { getTodayString } from '@/shared/utils'
import { clearScheduleWidgets, syncScheduleWidgets } from '@/features/scheduleWidgets'
import {
	cancelScheduledReminders,
	clearScheduleReminders,
	initReminderListeners,
	syncScheduleSnapshot,
	syncScheduleReminders,
} from '../lib/mobileReminders'
import { useScheduleRemindersStore } from '../model/store'

function shouldRefetchToday(todayLoadedAt: number | null, lessonsDate?: string): boolean {
	if (!todayLoadedAt) return true
	if (lessonsDate !== getTodayString()) return true

	const ageMs = Date.now() - todayLoadedAt
	return ageMs > 30 * 60_000
}

export function useInitScheduleReminders() {
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const remindersEnabled = useScheduleRemindersStore(s => s.enabled)
	const today = useScheduleStore(s => s.today)
	const days = useScheduleStore(s => s.days)
	const todayLoadedAt = useScheduleStore(s => s.todayLoadedAt)
	const setToday = useScheduleStore(s => s.setToday)
	const setTodayStatus = useScheduleStore(s => s.setTodayStatus)
	const setTodayLoadedAt = useScheduleStore(s => s.setTodayLoadedAt)
	const setError = useScheduleStore(s => s.setError)
	const syncInFlightRef = useRef(false)

	useEffect(() => {
		initReminderListeners()
	}, [])

	useEffect(() => {
		if (!hasHydrated) return
		if (isAuthenticated) return
		clearScheduleReminders()
		clearScheduleWidgets()
	}, [hasHydrated, isAuthenticated])

	useEffect(() => {
		if (!hasHydrated || !isAuthenticated) return
		syncScheduleSnapshot(today)

		const todayStr = getTodayString()
		const tomorrowStr = (() => {
			const d = new Date(todayStr)
			d.setDate(d.getDate() + 1)
			return d.toISOString().slice(0, 10)
		})()
		const tomorrowLessons = days[tomorrowStr] ?? []

		syncScheduleWidgets(today, tomorrowLessons)
		if (!remindersEnabled) {
			cancelScheduledReminders()
			return
		}
		syncScheduleReminders(today)
	}, [hasHydrated, isAuthenticated, remindersEnabled, today, days])

	useEffect(() => {
		if (!hasHydrated || !isAuthenticated) return

		async function refreshTodayIfNeeded(force = false) {
			if (syncInFlightRef.current) return
			if (!force && !shouldRefetchToday(todayLoadedAt, today[0]?.date)) return

			syncInFlightRef.current = true
			try {
				setTodayStatus('loading')
				const lessons = await scheduleApi.getToday()
				setToday(lessons)
				setTodayLoadedAt(Date.now())
				setTodayStatus('success')
				setError(null)
			} catch (error) {
				const message =
					(error as { response?: { data?: { detail?: string } } })?.response
						?.data?.detail ?? 'Ошибка загрузки расписания'
				setError(message)
				setTodayStatus('error')
			} finally {
				syncInFlightRef.current = false
			}
		}

		refreshTodayIfNeeded()

		function handleVisibility() {
			if (document.visibilityState !== 'visible') return
			refreshTodayIfNeeded()
		}

		document.addEventListener('visibilitychange', handleVisibility)
		return () => document.removeEventListener('visibilitychange', handleVisibility)
	}, [
		hasHydrated,
		isAuthenticated,
		setError,
		setToday,
		setTodayLoadedAt,
		setTodayStatus,
		today,
		todayLoadedAt,
	])
}
