import type { GradeMarks, GradeType } from '@/shared/types'

export type { GradeMarks, GradeType } from '@/shared/types'

export interface GradeEntryExpanded extends GradeEntry {
	flatMarks: Array<{ type: GradeType; value: number }>
	averageMark: number | null
}

export interface GradeEntry {
	date: string
	lesson_number: number
	attended: 'present' | 'late' | 'absent'
	spec_id: number
	spec_name: string
	teacher: string
	theme: string
	marks: GradeMarks | null
}

export interface SubjectStats {
	spec_id: number
	spec_name: string
	entries: GradeEntryExpanded[]
	averageGrade: number
	totalMarks: number
}
