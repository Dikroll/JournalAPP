export interface FutureExamItem {
	date: string
	spec: string
	days_left: number | null
}

export interface ExamResult {
	exam_id: number
	spec: string
	teacher: string
	mark: number
	mark_type: string
	date: string | null
	comment: string | null
	has_file: boolean
}
