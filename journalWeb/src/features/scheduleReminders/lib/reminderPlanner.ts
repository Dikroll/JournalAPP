import type { LessonItem } from '@/entities/schedule'

export const LESSON_REMINDER_OFFSET_MINUTES = 15

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

function getReminderId(date: string, lessonNumber: number): number {
	let hash = 17
	const source = `${date}:${lessonNumber}:lesson-reminder`
	for (let i = 0; i < source.length; i++) {
		hash = (hash * 31 + source.charCodeAt(i)) | 0
	}
	return Math.abs(hash)
}

function toScheduleDate(date: string, time: string): Date {
	return new Date(`${date}T${time}:00`)
}

function getReminderBody(lesson: LessonItem): string {
	const room = lesson.room?.trim()
	const teacher = lesson.teacher?.trim()
	const parts = [`${lesson.started_at} - ${lesson.finished_at}`]

	if (room) parts.push(`ауд. ${room}`)
	if (teacher) parts.push(teacher)

	return parts.join(' · ')
}

export function buildLessonReminderDrafts(
	lessons: LessonItem[],
	now = new Date(),
): ReminderNotificationDraft[] {
	return [...lessons]
		.sort((a, b) => a.lesson - b.lesson)
		.map(lesson => {
			const lessonStart = toScheduleDate(lesson.date, lesson.started_at)
			const at = new Date(
				lessonStart.getTime() - LESSON_REMINDER_OFFSET_MINUTES * 60_000,
			)

			return {
				id: getReminderId(lesson.date, lesson.lesson),
				title: `Скоро пара: ${lesson.subject}`,
				body: getReminderBody(lesson),
				at,
				extra: {
					route: '/schedule',
					date: lesson.date,
					lesson: lesson.lesson,
					subject: lesson.subject,
				},
			}
		})
		.filter(item => item.at.getTime() > now.getTime() + 30_000)
}
