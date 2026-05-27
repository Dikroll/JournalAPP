import type { GradeEntryExpanded } from "../model/types";

export interface GradeDotInfo {
	color: string;
	label: string;
	description: string;
}

export const GRADE_DOT_LEGEND: GradeDotInfo[] = [
	{
		color: "var(--color-checked)",
		label: "Отлично (5)",
		description: "Все оценки за день — 5.",
	},
	{
		color: "var(--color-new)",
		label: "Хорошо (4) или посещение",
		description:
			"Минимальная оценка за день — 4, либо есть посещение без оценки.",
	},
	{
		color: "var(--color-pending)",
		label: "Удовлетворительно (3)",
		description: "Минимальная оценка за день — 3.",
	},
	{
		color: "var(--color-overdue)",
		label: "Долг / пропуск / 1-2",
		description: "Есть пропуск или оценка ниже 3.",
	},
];

export function getGradeDotInfo(entries: GradeEntryExpanded[]): GradeDotInfo {
	const hasAbsence = entries.some((e) => e.attended === "absent");
	if (hasAbsence) return GRADE_DOT_LEGEND[3];

	const allMarks = entries.flatMap((e) => e.flatMarks.map((m) => m.value));
	if (!allMarks.length) return GRADE_DOT_LEGEND[1];

	const minMark = Math.min(...allMarks);
	if (minMark >= 5) return GRADE_DOT_LEGEND[0];
	if (minMark >= 4) return GRADE_DOT_LEGEND[1];
	if (minMark >= 3) return GRADE_DOT_LEGEND[2];
	return GRADE_DOT_LEGEND[3];
}

export function getGradeDotColor(entries: GradeEntryExpanded[]): string {
	return getGradeDotInfo(entries).color;
}
