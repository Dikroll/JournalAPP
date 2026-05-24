import { toMinutes } from '@/shared/hooks'
import type { LessonItem } from '../model/types'
import { type GapType, formatGapMinutes } from './scheduleGaps'

export interface ScheduleTimeInfo {
	type: 'before-lessons' | 'in-lesson' | 'in-gap' | 'after-lessons'
	label: string
	minutesLeft: number
	nextLesson?: LessonItem
	currentLesson?: LessonItem
	gapType?: GapType
}

export function getScheduleTimeInfo(
	lessons: LessonItem[],
	nowMinutes: number,
): ScheduleTimeInfo {
	if (lessons.length === 0) {
		return { type: 'after-lessons', label: 'Пар нет', minutesLeft: 0 }
	}

	const sorted = [...lessons].sort(
		(a, b) => toMinutes(a.started_at) - toMinutes(b.started_at),
	)

	const firstStart = toMinutes(sorted[0].started_at)
	const lastEnd = toMinutes(sorted[sorted.length - 1].finished_at)

	// До начала первой пары
	if (nowMinutes < firstStart) {
		const left = firstStart - nowMinutes
		return {
			type: 'before-lessons',
			label: `До первой пары: ${formatGapMinutes(left)}`,
			minutesLeft: left,
			nextLesson: sorted[0],
		}
	}

	// После окончания всех пар
	if (nowMinutes > lastEnd) {
		return {
			type: 'after-lessons',
			label: 'Пары закончились',
			minutesLeft: 0,
		}
	}

	// Проверяем, идёт ли сейчас пара
	for (const lesson of sorted) {
		const start = toMinutes(lesson.started_at)
		const end = toMinutes(lesson.finished_at)
		if (nowMinutes >= start && nowMinutes <= end) {
			const left = end - nowMinutes
			return {
				type: 'in-lesson',
				label: `Сейчас: ${lesson.subject} (ост. ${formatGapMinutes(left)})`,
				minutesLeft: left,
				currentLesson: lesson,
			}
		}
	}

	// В промежутке между парами
	for (let i = 0; i < sorted.length - 1; i++) {
		const prevEnd = toMinutes(sorted[i].finished_at)
		const nextStart = toMinutes(sorted[i + 1].started_at)
		if (nowMinutes > prevEnd && nowMinutes < nextStart) {
			const left = nextStart - nowMinutes
			const gap = nextStart - prevEnd
			const gapType: GapType =
				gap >= 60 ? 'window' : gap >= 30 ? 'lunch' : 'break'
			const gapLabel =
				gapType === 'lunch'
					? 'Обед'
					: gapType === 'window'
						? 'Окно'
						: 'Перемена'
			return {
				type: 'in-gap',
				label: `${gapLabel} · до пары: ${formatGapMinutes(left)}`,
				minutesLeft: left,
				nextLesson: sorted[i + 1],
				gapType,
			}
		}
	}

	return { type: 'after-lessons', label: 'Пары закончились', minutesLeft: 0 }
}

export function getLessonTimeLabel(
	info: ScheduleTimeInfo | null | undefined,
	lesson: LessonItem,
): string | undefined {
	if (!info) return undefined
	if (
		info.type === 'in-lesson' &&
		info.currentLesson?.lesson === lesson.lesson
	) {
		return `ост. ${formatGapMinutes(info.minutesLeft)}`
	}
	if (
		(info.type === 'before-lessons' || info.type === 'in-gap') &&
		info.nextLesson?.lesson === lesson.lesson
	) {
		return `через ${formatGapMinutes(info.minutesLeft)}`
	}
	return undefined
}
