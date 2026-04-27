import { examApi, useExamStore } from '@/entities/exam'
import { useAuthStore, useHydrationStore } from '@/shared/model'
import { useEffect, useRef } from 'react'
import {
	cancelScheduledExamReminders,
	syncExamReminders,
} from '../lib/mobileReminders'
import { useExamRemindersStore } from '../model/store'

export function useInitExamReminders() {
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const exams = useExamStore(s => s.exams)
	const setExams = useExamStore(s => s.setExams)
	const setStatus = useExamStore(s => s.setStatus)
	const setLoadedAt = useExamStore(s => s.setLoadedAt)
	const fetchedRef = useRef(false)

	const enabled = useExamRemindersStore(s => s.enabled)
	const dayBeforeEnabled = useExamRemindersStore(s => s.dayBeforeEnabled)
	const dailyEnabled = useExamRemindersStore(s => s.dailyEnabled)
	const startDays = useExamRemindersStore(s => s.startDays)
	const frequency = useExamRemindersStore(s => s.frequency)
	const notifyHour = useExamRemindersStore(s => s.notifyHour)

	useEffect(() => {
		if (!hasHydrated) return
		if (!isAuthenticated) {
			cancelScheduledExamReminders()
			return
		}
		if (fetchedRef.current) return

		fetchedRef.current = true
		setStatus('loading')
		examApi
			.getFutureExams()
			.then(data => {
				setExams(data)
				setLoadedAt(Date.now())
				setStatus('success')
			})
			.catch(() => {
				setStatus('error')
				fetchedRef.current = false
			})
	}, [hasHydrated, isAuthenticated, setExams, setLoadedAt, setStatus])

	useEffect(() => {
		if (!hasHydrated || !isAuthenticated) return

		if (!enabled) {
			cancelScheduledExamReminders()
			return
		}

		syncExamReminders(exams, {
			enabled,
			dayBeforeEnabled,
			dailyEnabled,
			startDays,
			frequency,
			notifyHour,
		})
	}, [
		hasHydrated,
		isAuthenticated,
		exams,
		enabled,
		dayBeforeEnabled,
		dailyEnabled,
		startDays,
		frequency,
		notifyHour,
	])
}
