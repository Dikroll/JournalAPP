import { useScheduleStore } from '@/entities/schedule'
import { useMemo } from 'react'

function todayIso(): string {
	return new Date().toISOString().slice(0, 10)
}

function norm(name: string): string {
	return name.trim().toLowerCase()
}

/**
 * Returns a Set of normalized subject names that have at least one
 * lesson scheduled strictly after today across any cached schedule view.
 */
export function useFutureScheduledSubjects(): Set<string> {
	const today = useScheduleStore(s => s.today)
	const days = useScheduleStore(s => s.days)
	const weeks = useScheduleStore(s => s.weeks)
	const months = useScheduleStore(s => s.months)

	return useMemo(() => {
		const cutoff = todayIso()
		const names = new Set<string>()
		const visit = (list: Array<{ date: string; subject: string }>) => {
			for (const l of list) {
				if (l.date > cutoff && l.subject) names.add(norm(l.subject))
			}
		}
		visit(today)
		for (const list of Object.values(days)) visit(list)
		for (const list of Object.values(weeks)) visit(list)
		for (const list of Object.values(months)) visit(list)
		return names
	}, [today, days, weeks, months])
}

export function normalizeSubjectName(name: string): string {
	return norm(name)
}
