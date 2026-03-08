export interface UploadFileResponse {
	filename: string
	file_path: string
	tmp_file: string
}

export interface SubmitHomeworkPayload {
	id: number
	stud_answer: string | null
	filename: string | null
	file_path: string | null
	tmp_file: string | null
	spent_hours?: number
	spent_minutes?: number
}
