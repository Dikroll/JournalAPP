export interface UploadFileResponse {
	filename: string
	file_path: string
	tmp_file: string
}

export interface SubmitHomeworkPayload {
	id: number
	stud_answer: string | null
	mark: number | null
	creation_time: string
	filename: string | null
	file_path: string | null
	tmp_file: string | null
	auto_mark: boolean
}

export interface HomeworkCounters {
	total: number
	pending: number
	checked: number
	overdue: number
	new: number
	returned: number
}

export interface HomeworkItem {
	id: number
	theme: string | null
	spec_id: number | null
	spec_name: string
	teacher: string | null
	issued_date: string
	deadline: string
	overdue_date: string | null
	grade: number | null
	stud_answer: string | null
	status: number
	has_file: boolean | null
	file_url: string | null
	comment: string | null
	stud_id: number | null
	stud_file_url: string | null
	stud_filename: string | null
}

export interface HomeworkAllResponse {
	counters: HomeworkCounters
	items: Record<string, HomeworkItem[]>
}

export interface HomeworkBySubjectResponse {
	spec_id: number
	counters: HomeworkCounters
	items: Record<string, HomeworkItem[]>
}
export type HomeworkStatus =
	| 'overdue'
	| 'new'
	| 'pending'
	| 'checked'
	| 'returned'

export type HomeworkItemWithStatus = HomeworkItem & {
	statusKey: HomeworkStatus
}

export type GroupData = {
	items: HomeworkItemWithStatus[]
	total: number
	hasMore: boolean
	isExpanded: boolean
}
