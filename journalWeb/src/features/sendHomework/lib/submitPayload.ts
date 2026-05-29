import type { SubmitHomeworkPayload } from "../model/types";

const DEFAULT_SPENT_HOURS = 0;
const DEFAULT_SPENT_MINUTES = 0;

export function createHomeworkSubmitPayload({
	id,
	text,
	filename,
	filePath,
	tmpFile,
	mark,
}: {
	id: number;
	text: string;
	filename: string;
	filePath: string;
	tmpFile: string;
	mark: number;
}): SubmitHomeworkPayload {
	return {
		id,
		stud_answer: text || null,
		filename: filename || null,
		file_path: filePath || null,
		tmp_file: tmpFile || null,
		mark,
		creation_time: new Date().toISOString(),
		spent_hours: DEFAULT_SPENT_HOURS,
		spent_minutes: DEFAULT_SPENT_MINUTES,
	};
}
