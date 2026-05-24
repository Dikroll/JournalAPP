import { toDateString } from '@/shared/utils'
import type { LessonItem } from '../model/types'

export function getWeekDays(anyDateStr: string): string[] {
	const d = new Date(`${anyDateStr}T00:00:00`)
	const dow = d.getDay()
	const monday = new Date(d)
	monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
	return Array.from({ length: 7 }, (_, i) => {
		const day = new Date(monday)
		day.setDate(monday.getDate() + i)
		return toDateString(day.getFullYear(), day.getMonth(), day.getDate())
	})
}

export function shiftWeek(dateStr: string, delta: number): string {
	const d = new Date(`${dateStr}T00:00:00`)
	d.setDate(d.getDate() + delta * 7)
	return toDateString(d.getFullYear(), d.getMonth(), d.getDate())
}

export function groupLessonsByDate(
	lessons: LessonItem[],
	days: string[],
): Record<string, LessonItem[]> {
	return Object.fromEntries(
		days.map(d => [
			d,
			lessons.filter(l => l.date === d).sort((a, b) => a.lesson - b.lesson),
		]),
	)
}
