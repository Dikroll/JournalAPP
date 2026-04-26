import {
	getGradeStyle,
	STATUS_CONFIG,
} from '@/entities/homework/configs/homeworkConfig'
import type { HomeworkItemWithStatus } from '@/entities/homework/model/types'

export interface HomeworkCardState {
	config: (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG]
	isChecked: boolean
	isReturned: boolean
	isOverdue: boolean
	isNew: boolean
	grade: number | null
	gradeStyle: ReturnType<typeof getGradeStyle> | null
	cardBg: string
	hasComment: boolean
	commentAlwaysVisible: boolean
}

export function deriveHomeworkCardState(
	hw: HomeworkItemWithStatus,
): HomeworkCardState {
	const config = STATUS_CONFIG[hw.statusKey]
	const isChecked = hw.statusKey === 'checked'
	const isReturned = hw.statusKey === 'returned'
	const isOverdue = hw.statusKey === 'overdue'
	const isNew = hw.statusKey === 'new'

	const grade = isChecked ? hw.grade : null
	const gradeStyle = grade != null ? getGradeStyle(grade) : null

	const cardBg = gradeStyle
		? gradeStyle.bg
		: isOverdue
		? 'bg-app-surface'
		: 'bg-app-surface'

	const hasComment = !!hw.comment
	const commentAlwaysVisible = isReturned

	return {
		config,
		isChecked,
		isReturned,
		isOverdue,
		isNew,
		grade,
		gradeStyle,
		cardBg,
		hasComment,
		commentAlwaysVisible,
	}
}

export function shouldShowStatusBadge(state: HomeworkCardState): boolean {
	return state.isNew || state.isOverdue || state.isReturned
}

export function canEditHomework(state: HomeworkCardState): boolean {
	return !state.isChecked && !state.isReturned
}
