import type { LessonItem } from '@/entities/schedule'
import { getScheduleTimeInfo } from '@/entities/schedule'
import { toMinutes } from '@/shared/hooks'
import { getTodayString } from '@/shared/utils'

export interface ScheduleWidgetLesson {
	lesson: number
	subject: string
	room: string
	teacher: string
	startedAt: string
	finishedAt: string
	date: string
}

export interface ScheduleWidgetPayload {
	date: string
	savedAt: number
	summary: string
	isEmpty: boolean
	nextLesson: ScheduleWidgetLesson | null
	lessons: ScheduleWidgetLesson[]
	tomorrowFirstLesson: ScheduleWidgetLesson | null
	completedCount: number
	totalCount: number
}

function toWidgetLesson(lesson: LessonItem): ScheduleWidgetLesson {
	return {
		lesson: lesson.lesson,
		subject: lesson.subject,
		room: lesson.room,
		teacher: lesson.teacher,
		startedAt: lesson.started_at,
		finishedAt: lesson.finished_at,
		date: lesson.date,
	}
}

function countCompleted(lessons: LessonItem[], nowMinutes: number): number {
	return lessons.filter(l => toMinutes(l.finished_at) <= nowMinutes).length
}

export function buildScheduleWidgetPayload(
	lessons: LessonItem[],
	now = new Date(),
	tomorrowLessons: LessonItem[] = [],
): ScheduleWidgetPayload {
	const sorted = [...lessons].sort((a, b) => a.lesson - b.lesson)
	const nowMinutes = toMinutes(now.toTimeString().slice(0, 5))
	const timeInfo = getScheduleTimeInfo(sorted, nowMinutes)
	const date = sorted[0]?.date ?? getTodayString()

	const tomorrowSorted = [...tomorrowLessons].sort((a, b) => a.lesson - b.lesson)
	const tomorrowFirst = tomorrowSorted[0]
		? toWidgetLesson(tomorrowSorted[0])
		: null

	return {
		date,
		savedAt: now.getTime(),
		summary: timeInfo.label,
		isEmpty: sorted.length === 0,
		nextLesson: timeInfo.nextLesson
			? toWidgetLesson(timeInfo.nextLesson)
			: timeInfo.currentLesson
				? toWidgetLesson(timeInfo.currentLesson)
				: null,
		lessons: sorted.slice(0, 6).map(toWidgetLesson),
		tomorrowFirstLesson: tomorrowFirst,
		completedCount: countCompleted(sorted, nowMinutes),
		totalCount: sorted.length,
	}
}
