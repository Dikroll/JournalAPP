export interface GradeMarks {
	control: number | null
	homework: number | null
	lab: number | null
	classwork: number | null
	practical: number | null
	final: number | null
}

export type GradeType = keyof GradeMarks
