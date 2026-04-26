import { lastValue, useDashboardChartsStore } from '@/entities/dashboard'
import { useGradesStore } from '@/entities/grades/model/store'
import { useOverallSummary } from '@/features/goalForecast'
import { useAuthStore } from '@/shared/model'
import { useHydrationStore } from '@/shared/model/authStore'
import { useEffect } from 'react'
import { clearGoalsWidget, syncGoalsWidget } from '../lib/widgetBridge'

export function useInitGoalsWidget() {
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const progress = useDashboardChartsStore(s => s.progress)
	const attendance = useDashboardChartsStore(s => s.attendance)
	const gradeEntries = useGradesStore(s => s.entries)
	const summary = useOverallSummary()

	useEffect(() => {
		if (!hasHydrated) return
		if (isAuthenticated) return
		clearGoalsWidget()
	}, [hasHydrated, isAuthenticated])

	useEffect(() => {
		if (!hasHydrated || !isAuthenticated) return
		syncGoalsWidget({
			avg: lastValue(progress),
			attendance: lastValue(attendance),
			gradeEntries,
			summary,
		})
	}, [hasHydrated, isAuthenticated, progress, attendance, gradeEntries, summary])
}
