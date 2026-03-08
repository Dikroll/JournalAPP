export interface UploadFileResponse {
	filename: string
	file_path: string
	tmp_file: string
}

export interface SubmitHomeworkPayload {
	id: number
	stud_answer: string | null
	mark: number | null
	creation_time: string        // "YYYY-MM-DD"
	filename: string | null
	file_path: string | null
	tmp_file: string | null
	auto_mark: boolean
}