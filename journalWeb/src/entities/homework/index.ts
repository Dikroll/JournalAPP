export { homeworkApi } from './api'

export {
	getGradeStyle,
	STATUS_CONFIG,
	STATUS_KEY_MAP,
	STATUS_MAP,
	STATUS_ORDER,
} from './configs/homeworkConfig'
export { useHomework } from './hooks/useHomework'
export { useHomeworkBySubject } from './hooks/useHomeworkBySubject'
export { useHomeworkGroups } from './hooks/useHomeworkGroups'
export { useHomeworkStore } from './model/store'
export type { SubjectData } from './model/store'
export type {
	GroupData,
	HomeworkCounters,
	HomeworkItem,
	HomeworkItemWithStatus,
	HomeworkStatus,
	UploadFileResponse,
} from './model/types'
