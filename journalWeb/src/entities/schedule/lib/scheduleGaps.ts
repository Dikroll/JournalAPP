import { toMinutes } from '@/shared/hooks'
import type { LessonItem } from '../model/types'

export type GapType = 'break' | 'lunch' | 'window'

export interface GapInfo {
	type: GapType
	minutes: number
}

export function getGapBetweenLessons(
	prev: LessonItem,
	next: LessonItem,
): GapInfo {
	const gap = toMinutes(next.started_at) - toMinutes(prev.finished_at)
	const minutes = Math.max(gap, 0)

	if (minutes >= 60) return { type: 'window', minutes }
	if (minutes >= 30) return { type: 'lunch', minutes }
	return { type: 'break', minutes }
}

export function formatGapMinutes(minutes: number): string {
	if (minutes >= 60) {
		const h = Math.floor(minutes / 60)
		const m = minutes % 60
		return m > 0 ? `${h}ч ${m}мин` : `${h}ч`
	}
	return `${minutes} мин`
}
