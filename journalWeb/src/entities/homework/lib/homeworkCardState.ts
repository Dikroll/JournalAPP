import {
	getGradeStyle,
	STATUS_CONFIG,
} from "@/entities/homework/configs/homeworkConfig";
import type { HomeworkItemWithStatus } from "@/entities/homework/model/types";

export interface HomeworkCardState {
	config: (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG];
	isChecked: boolean;
	isReturned: boolean;
	isOverdue: boolean;
	isNew: boolean;
	isExpired: boolean;
	grade: number | null;
	gradeStyle: ReturnType<typeof getGradeStyle> | null;
	cardBg: string;
	hasComment: boolean;
	commentAlwaysVisible: boolean;
}

/**
 * Returns true if the homework overdue date is more than 6 months ago.
 * After 6 months past the overdue date, the upstream API rejects submissions.
 */
export function isHomeworkExpired(
	overdueDate: string | null | undefined,
): boolean {
	if (!overdueDate) return false;
	const overdue = new Date(overdueDate);
	if (Number.isNaN(overdue.getTime())) return false;
	const sixMonthsAgo = new Date();
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
	return overdue < sixMonthsAgo;
}

export function deriveHomeworkCardState(
	hw: HomeworkItemWithStatus,
): HomeworkCardState {
	const config = STATUS_CONFIG[hw.statusKey];
	const isChecked = hw.statusKey === "checked";
	const isReturned = hw.statusKey === "returned";
	const isOverdue = hw.statusKey === "overdue";
	const isNew = hw.statusKey === "new";
	const isExpired = isHomeworkExpired(hw.overdue_date);

	const grade = isChecked ? hw.grade : null;
	const gradeStyle = grade != null ? getGradeStyle(grade) : null;

	const cardBg = gradeStyle
		? gradeStyle.bg
		: isOverdue
			? "bg-app-surface"
			: "bg-app-surface";

	const hasComment = !!hw.comment;
	const commentAlwaysVisible = isReturned;

	return {
		config,
		isChecked,
		isReturned,
		isOverdue,
		isNew,
		isExpired,
		grade,
		gradeStyle,
		cardBg,
		hasComment,
		commentAlwaysVisible,
	};
}

export function shouldShowStatusBadge(state: HomeworkCardState): boolean {
	return state.isNew || state.isOverdue || state.isReturned;
}

export function canEditHomework(state: HomeworkCardState): boolean {
	return !state.isChecked && !state.isReturned;
}
