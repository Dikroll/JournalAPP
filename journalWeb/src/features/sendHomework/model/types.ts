export interface SubmitHomeworkPayload {
	id: number;
	stud_answer: string | null;
	filename: string | null;
	file_path: string | null;
	tmp_file: string | null;
	mark: number;
	creation_time: string;
	spent_hours: number;
	spent_minutes: number;
}

export type SendStep =
	| "idle"
	| "uploading"
	| "submitting"
	| "success"
	| "queued"
	| "error";
