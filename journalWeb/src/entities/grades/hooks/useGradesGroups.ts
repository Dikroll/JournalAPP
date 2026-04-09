import { useMemo } from 'react'
import type {
	GradeEntry,
	GradeEntryExpanded,
	GradeMarks,
	GradeType,
	SubjectStats,
} from '../model/types'

export function flattenMarks(
	marks: GradeMarks,
): Array<{ type: GradeType; value: number }> {
	return (Object.entries(marks) as [GradeType, number | null][])
		.filter(([, v]) => v != null && v !== 0)
		.map(([type, value]) => ({ type, value: value! }))
}

type ActiveTab = 'recent' | 'calendar' | 'subjects' | 'exams'

function expandEntries(entries: GradeEntry[]): GradeEntryExpanded[] {
	return entries.map(e => {
		const flatMarks = e.marks ? flattenMarks(e.marks) : []
		const averageMark = flatMarks.length
			? flatMarks.reduce((s, m) => s + m.value, 0) / flatMarks.length
			: null
		return { ...e, flatMarks, averageMark }
	})
}

function groupByDate(
	expanded: GradeEntryExpanded[],
): Array<{ date: string; items: GradeEntryExpanded[] }> {
	const map: Record<string, GradeEntryExpanded[]> = {}
	for (const e of expanded) {
		if (!map[e.date]) map[e.date] = []
		map[e.date].push(e)
	}
	return Object.entries(map)
		.sort(([a], [b]) => b.localeCompare(a))
		.map(([date, items]) => ({
			date,
			items: [...items].sort((a, b) => a.lesson_number - b.lesson_number),
		}))
}

function groupBySubject(expanded: GradeEntryExpanded[]): SubjectStats[] {
	const map: Record<number, GradeEntryExpanded[]> = {}
	for (const e of expanded) {
		if (!map[e.spec_id]) map[e.spec_id] = []
		map[e.spec_id].push(e)
	}
	return Object.values(map)
		.map(items => {
			const withMarks = items.filter(e => e.flatMarks.length > 0)
			const allMarks = withMarks.flatMap(e => e.flatMarks.map(m => m.value))
			const avg = allMarks.length
				? allMarks.reduce((s, v) => s + v, 0) / allMarks.length
				: 0
			return {
				spec_id: items[0].spec_id,
				spec_name: items[0].spec_name,
				entries: withMarks.sort((a, b) => a.date.localeCompare(b.date)),
				averageGrade: avg,
				totalMarks: allMarks.length,
			}
		})
		.filter(s => s.totalMarks > 0)
		.sort((a, b) => a.spec_name.localeCompare(b.spec_name, 'ru'))
}

function groupByMonth(
	expanded: GradeEntryExpanded[],
): Record<string, Record<string, GradeEntryExpanded[]>> {
	const map: Record<string, Record<string, GradeEntryExpanded[]>> = {}
	for (const e of expanded) {
		const month = e.date.slice(0, 7)
		if (!map[month]) map[month] = {}
		if (!map[month][e.date]) map[month][e.date] = []
		map[month][e.date].push(e)
	}
	return map
}

function calcStats(expanded: GradeEntryExpanded[]) {
	const allMarks = expanded.flatMap(e => e.flatMarks.map(m => m.value))
	const avg = allMarks.length
		? allMarks.reduce((s, v) => s + v, 0) / allMarks.length
		: 0
	const total = expanded.length
	const absences = expanded.filter(e => e.attended === 'absent').length
	return {
		averageGrade: avg,
		attendanceRate: total > 0 ? ((total - absences) / total) * 100 : 0,
	}
}

export function useGradesGroups(entries: GradeEntry[], activeTab: ActiveTab) {
	const expanded = useMemo(() => expandEntries(entries), [entries])

	const byDate = useMemo(
		() => (activeTab === 'recent' ? groupByDate(expanded) : []),
		[expanded, activeTab],
	)

	const bySubject = useMemo(
		() => (activeTab === 'subjects' ? groupBySubject(expanded) : []),
		[expanded, activeTab],
	)

	const byMonth = useMemo(
		() =>
			activeTab === 'calendar'
				? groupByMonth(expanded)
				: ({} as Record<string, Record<string, GradeEntryExpanded[]>>),
		[expanded, activeTab],
	)

	const stats = useMemo(() => calcStats(expanded), [expanded])

	return { byDate, bySubject, byMonth, stats }
}
