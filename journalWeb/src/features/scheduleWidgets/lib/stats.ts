import type { GradeEntry, GradeMarks, GradeType } from '@/entities/grades/model/types'

export interface WidgetGradeStats {
	averageGrade: number | null
	attendancePercent: number | null
	totalMarks: number
}

function flattenMarks(marks: GradeMarks): number[] {
	return (Object.entries(marks) as [GradeType, number | null][])
		.filter(([, v]) => v != null && v !== 0)
		.map(([, v]) => v as number)
}

export function computeWidgetStats(entries: GradeEntry[]): WidgetGradeStats {
	if (entries.length === 0) {
		return { averageGrade: null, attendancePercent: null, totalMarks: 0 }
	}

	const allMarks = entries.flatMap(e => (e.marks ? flattenMarks(e.marks) : []))
	const averageGrade = allMarks.length
		? allMarks.reduce((s, v) => s + v, 0) / allMarks.length
		: null

	const total = entries.length
	const absences = entries.filter(e => e.attended === 'absent').length
	const attendancePercent = total > 0 ? ((total - absences) / total) * 100 : null

	return {
		averageGrade,
		attendancePercent,
		totalMarks: allMarks.length,
	}
}
