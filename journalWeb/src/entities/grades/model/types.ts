export interface GradeMarks {
	control: number | null
	homework: number | null
	lab: number | null
	classwork: number | null
	practical: number | null
	final: number | null
}
export interface GradeEntryExpanded extends GradeEntry {
	flatMarks: Array<{ type: GradeType; value: number }>
	averageMark: number | null
}

export interface GradeEntry {
	date: string
	lesson_number: number
	attended: boolean
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
export type GradeType = keyof GradeMarks
