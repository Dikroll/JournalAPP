import type { GradeEntryExpanded } from '../model/types'

export function getGradeDotColor(entries: GradeEntryExpanded[]): string {
	const hasAbsence = entries.some(e => !e.attended)
	if (hasAbsence) return 'var(--color-overdue)'

	const allMarks = entries.flatMap(e => e.flatMarks.map(m => m.value))
	if (!allMarks.length) return 'var(--color-new)'

	const minMark = Math.min(...allMarks)
	if (minMark >= 5) return 'var(--color-checked)'
	if (minMark >= 4) return 'var(--color-new)'
	if (minMark >= 3) return 'var(--color-pending)'
	return 'var(--color-overdue)'
}
