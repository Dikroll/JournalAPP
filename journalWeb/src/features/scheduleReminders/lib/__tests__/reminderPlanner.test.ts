import type { LessonItem } from '@/entities/schedule'
import { describe, expect, it } from 'vitest'
import {
	buildLessonReminderDrafts,
	LESSON_REMINDER_OFFSET_MINUTES,
} from '../reminderPlanner'

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

describe('buildLessonReminderDrafts', () => {
	it('builds reminders 15 minutes before each future lesson', () => {
		const drafts = buildLessonReminderDrafts(
			LESSONS,
			new Date('2026-04-23T08:00:00'),
		)

		expect(drafts).toHaveLength(2)
		expect(drafts[0].title).toContain('Математика')
		expect(drafts[0].at.getHours()).toBe(8)
		expect(drafts[0].at.getMinutes()).toBe(45)
		expect(drafts[1].at.getHours()).toBe(10)
		expect(drafts[1].at.getMinutes()).toBe(45)
		expect(drafts[0].extra.lesson).toBe(1)
		expect(drafts[1].extra.lesson).toBe(2)
	})

	it('skips lessons when reminder time has already passed', () => {
		const drafts = buildLessonReminderDrafts(
			LESSONS,
			new Date(
				`2026-04-23T09:${String(LESSON_REMINDER_OFFSET_MINUTES).padStart(2, '0')}:31`,
			),
		)

		expect(drafts).toHaveLength(1)
		expect(drafts[0].extra.lesson).toBe(2)
	})
})
