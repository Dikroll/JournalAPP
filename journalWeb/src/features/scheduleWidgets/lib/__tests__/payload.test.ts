import type { LessonItem } from '@/entities/schedule'
import { describe, expect, it } from 'vitest'
import { buildScheduleWidgetPayload } from '../payload'

const LESSONS: LessonItem[] = [
	{
		date: '2026-04-23',
		lesson: 1,
		started_at: '09:00',
		finished_at: '10:30',
		teacher: 'Иванов И.И.',
		subject: 'Математика',
		room: '101',
	},
	{
		date: '2026-04-23',
		lesson: 2,
		started_at: '11:00',
		finished_at: '12:30',
		teacher: 'Петров П.П.',
		subject: 'Физика',
		room: '202',
	},
]

describe('buildScheduleWidgetPayload', () => {
	it('keeps today summary and next lesson', () => {
		const payload = buildScheduleWidgetPayload(
			LESSONS,
			new Date('2026-04-23T08:00:00'),
		)

		expect(payload.date).toBe('2026-04-23')
		expect(payload.isEmpty).toBe(false)
		expect(payload.nextLesson?.subject).toBe('Математика')
		expect(payload.lessons).toHaveLength(2)
		expect(payload.summary).toContain('До первой пары')
	})

	it('marks empty days correctly', () => {
		const payload = buildScheduleWidgetPayload([], new Date('2026-04-23T08:00:00'))

		expect(payload.isEmpty).toBe(true)
		expect(payload.nextLesson).toBeNull()
		expect(payload.lessons).toHaveLength(0)
	})

	it('includes tomorrow first lesson when provided', () => {
		const tomorrow: LessonItem[] = [
			{
				date: '2026-04-24',
				lesson: 1,
				started_at: '08:30',
				finished_at: '10:00',
				teacher: 'Сидоров С.С.',
				subject: 'Биология',
				room: '303',
			},
		]
		const payload = buildScheduleWidgetPayload(
			LESSONS,
			new Date('2026-04-23T20:00:00'),
			tomorrow,
		)

		expect(payload.tomorrowFirstLesson?.subject).toBe('Биология')
		expect(payload.tomorrowFirstLesson?.startedAt).toBe('08:30')
	})

	it('has null tomorrowFirstLesson when not provided', () => {
		const payload = buildScheduleWidgetPayload(
			LESSONS,
			new Date('2026-04-23T08:00:00'),
		)
		expect(payload.tomorrowFirstLesson).toBeNull()
	})
})
