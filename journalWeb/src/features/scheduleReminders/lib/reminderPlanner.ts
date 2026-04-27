import type { LessonItem } from '@/entities/schedule'

export const FIRST_LESSON_REMINDER_OFFSET_MINUTES = 30
export const LESSON_REMINDER_OFFSET_MINUTES = 15
export const POST_LUNCH_LESSON_REMINDER_OFFSET_MINUTES = 10
export const LUNCH_BREAK_MIN_MINUTES = 25
export const LUNCH_BREAK_GAP_OFFSET_MINUTES = 15

export interface ReminderConfig {
	firstLessonEnabled: boolean
	firstLessonOffsetMinutes: number
	regularLessonEnabled: boolean
	regularLessonOffsetMinutes: number
	lunchBreakEnabled: boolean
	postLunchEnabled: boolean
	postLunchOffsetMinutes: number
}

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
	firstLessonEnabled: true,
	firstLessonOffsetMinutes: FIRST_LESSON_REMINDER_OFFSET_MINUTES,
	regularLessonEnabled: true,
	regularLessonOffsetMinutes: LESSON_REMINDER_OFFSET_MINUTES,
	lunchBreakEnabled: true,
	postLunchEnabled: true,
	postLunchOffsetMinutes: POST_LUNCH_LESSON_REMINDER_OFFSET_MINUTES,
}

export interface ReminderNotificationDraft {
	id: number
	title: string
	body: string
	at: Date
	extra: {
		route: string
		date: string
		lesson: number
		subject: string
	}
}

function getReminderId(date: string, lessonNumber: number, kind: string): number {
	let hash = 17
	const source = `${date}:${lessonNumber}:${kind}`
	for (let i = 0; i < source.length; i++) {
		hash = (hash * 31 + source.charCodeAt(i)) | 0
	}
	return Math.abs(hash)
}

function toScheduleDate(date: string, time: string): Date {
	return new Date(`${date}T${time}:00`)
}

function diffMinutes(from: Date, to: Date): number {
	return Math.round((to.getTime() - from.getTime()) / 60_000)
}

function getLessonReminderBody(lesson: LessonItem): string {
	const room = lesson.room?.trim()
	const teacher = lesson.teacher?.trim()
	const parts = [`${lesson.started_at} - ${lesson.finished_at}`]

	if (room) parts.push(`ауд. ${room}`)
	if (teacher) parts.push(teacher)

	return parts.join(' · ')
}

function getLunchBreakBody(nextLesson: LessonItem): string {
	const room = nextLesson.room?.trim()
	const parts = [
		`Можно поесть. Следующая пара в ${nextLesson.started_at} — ${nextLesson.subject}`,
	]
	if (room) parts.push(`ауд. ${room}`)
	return parts.join(' · ')
}

function detectLunchBreakIndices(sorted: LessonItem[]): Set<number> {
	const lunchIndices = new Set<number>()
	if (sorted.length < 2) return lunchIndices

	const gaps: number[] = []
	for (let i = 1; i < sorted.length; i++) {
		const prevEnd = toScheduleDate(sorted[i - 1].date, sorted[i - 1].finished_at)
		const currStart = toScheduleDate(sorted[i].date, sorted[i].started_at)
		gaps.push(diffMinutes(prevEnd, currStart))
	}

	const minGap = Math.min(...gaps)
	const relativeFloor =
		gaps.length > 1 ? minGap + LUNCH_BREAK_GAP_OFFSET_MINUTES : 0
	const threshold = Math.max(LUNCH_BREAK_MIN_MINUTES, relativeFloor)

	gaps.forEach((gap, idx) => {
		if (gap >= threshold) lunchIndices.add(idx + 1)
	})
	return lunchIndices
}

export function buildLessonReminderDrafts(
	lessons: LessonItem[],
	now: Date = new Date(),
	config: ReminderConfig = DEFAULT_REMINDER_CONFIG,
): ReminderNotificationDraft[] {
	const sorted = [...lessons].sort((a, b) => a.lesson - b.lesson)
	const lunchIndices = detectLunchBreakIndices(sorted)
	const drafts: ReminderNotificationDraft[] = []

	sorted.forEach((lesson, idx) => {
		const lessonStart = toScheduleDate(lesson.date, lesson.started_at)
		const isFirst = idx === 0
		const isPostLunch = idx > 0 && lunchIndices.has(idx)

		const lessonReminderEnabled = isFirst
			? config.firstLessonEnabled
			: isPostLunch
				? config.postLunchEnabled
				: config.regularLessonEnabled

		if (lessonReminderEnabled) {
			const offset = isFirst
				? config.firstLessonOffsetMinutes
				: isPostLunch
					? config.postLunchOffsetMinutes
					: config.regularLessonOffsetMinutes

			drafts.push({
				id: getReminderId(lesson.date, lesson.lesson, 'lesson-reminder'),
				title: `Скоро пара: ${lesson.subject}`,
				body: getLessonReminderBody(lesson),
				at: new Date(lessonStart.getTime() - offset * 60_000),
				extra: {
					route: '/schedule',
					date: lesson.date,
					lesson: lesson.lesson,
					subject: lesson.subject,
				},
			})
		}

		if (isPostLunch && config.lunchBreakEnabled) {
			const prev = sorted[idx - 1]
			const prevEnd = toScheduleDate(prev.date, prev.finished_at)
			const breakMinutes = diffMinutes(prevEnd, lessonStart)

			drafts.push({
				id: getReminderId(lesson.date, lesson.lesson, 'lunch-break'),
				title: `Перерыв ${breakMinutes} мин`,
				body: getLunchBreakBody(lesson),
				at: prevEnd,
				extra: {
					route: '/schedule',
					date: lesson.date,
					lesson: lesson.lesson,
					subject: lesson.subject,
				},
			})
		}
	})

	return drafts.filter(item => item.at.getTime() > now.getTime() + 30_000)
}
