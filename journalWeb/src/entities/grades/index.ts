export { getGradeColor, GRADE_TYPE_CONFIG } from './config/labelConfig'
export { useGrades } from './hooks/useGrades'
export { useGradesBySubject } from './hooks/useGradesBySubject'
export { useGradesGroups } from './hooks/useGradesGroups'

export { useGradesStore } from './model/store'
export type {
	GradeEntry,
	GradeEntryExpanded,
	SubjectStats,
} from './model/types'
