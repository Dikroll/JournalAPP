import type { GradeEntryExpanded } from "@/entities/grades";
import type { LessonItem } from "@/entities/schedule";
import { getTodayString } from "@/shared/utils";

export type DisplayItem =
	| { type: "grade"; entry: GradeEntryExpanded }
	| { type: "pending"; lesson: LessonItem };

export interface DisplayDay {
	date: string;
	items: DisplayItem[];
}

export function normalizeSubject(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function toMinutes(value: string): number {
	const [hours, minutes] = value.split(":").map(Number);
	if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
	return hours * 60 + minutes;
}

export function isPastLesson(lesson: LessonItem): boolean {
	const today = getTodayString();
	if (lesson.date < today) return true;
	if (lesson.date > today) return false;

	const now = new Date();
	const currentMinutes = now.getHours() * 60 + now.getMinutes();
	return toMinutes(lesson.finished_at) <= currentMinutes;
}

export function hasVisitForLesson(
	lesson: LessonItem,
	entries: GradeEntryExpanded[],
): boolean {
	const subject = normalizeSubject(lesson.subject);
	return entries.some(
		(entry) =>
			entry.date === lesson.date &&
			entry.lesson_number === lesson.lesson &&
			normalizeSubject(entry.spec_name) === subject,
	);
}

export function buildDisplayDays(
	byDate: Array<{ date: string; items: GradeEntryExpanded[] }>,
	scheduledLessons: LessonItem[] = [],
	selectedSubjectName: string | null = null,
): DisplayDay[] {
	const days = new Map<string, DisplayItem[]>();
	const entriesByDate = new Map<string, GradeEntryExpanded[]>();
	const selectedSubject = selectedSubjectName
		? normalizeSubject(selectedSubjectName)
		: null;

	for (const day of byDate) {
		entriesByDate.set(day.date, day.items);
		days.set(
			day.date,
			day.items.map((entry) => ({ type: "grade", entry })),
		);
	}

	for (const lesson of scheduledLessons) {
		if (
			selectedSubject &&
			normalizeSubject(lesson.subject) !== selectedSubject
		) {
			continue;
		}

		const entries = entriesByDate.get(lesson.date) ?? [];
		if (hasVisitForLesson(lesson, entries)) continue;

		const list = days.get(lesson.date) ?? [];
		list.push({ type: "pending", lesson });
		days.set(lesson.date, list);
	}

	return Array.from(days.entries())
		.sort(([a], [b]) => b.localeCompare(a))
		.map(([date, items]) => ({
			date,
			items: [...items].sort((a, b) => {
				const aLesson =
					a.type === "grade" ? a.entry.lesson_number : a.lesson.lesson;
				const bLesson =
					b.type === "grade" ? b.entry.lesson_number : b.lesson.lesson;
				return aLesson - bLesson;
			}),
		}));
}
