export interface SubmitHomeworkPayload {
	id: number
	stud_answer: string | null
	filename: string | null
	file_path: string | null
	tmp_file: string | null
	spent_hours?: number
	spent_minutes?: number
}
