import type { LessonItem } from '@/entities/schedule'
import { describe, expect, it } from 'vitest'
import {
	buildLessonReminderDrafts,
	FIRST_LESSON_REMINDER_OFFSET_MINUTES,
	LESSON_REMINDER_OFFSET_MINUTES,
	POST_LUNCH_LESSON_REMINDER_OFFSET_MINUTES,
} from '../reminderPlanner'

const DAY_WITH_LUNCH: LessonItem[] = [
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
		started_at: '10:40',
		finished_at: '12:10',
		teacher: 'Петров П.П.',
		subject: 'Физика',
		room: '202',
	},
	{
		date: '2026-04-23',
		lesson: 3,
		started_at: '12:40',
		finished_at: '14:10',
		teacher: 'Сидоров С.С.',
		subject: 'Химия',
		room: '303',
	},
]

const EARLY_MORNING = new Date('2026-04-23T07:00:00')

describe('buildLessonReminderDrafts', () => {
	it('reminds 30 minutes before the first lesson of the day', () => {
		const drafts = buildLessonReminderDrafts(DAY_WITH_LUNCH, EARLY_MORNING)
		const first = drafts.find(
			d => d.extra.lesson === 1 && !d.title.startsWith('Перерыв'),
		)

		expect(first).toBeDefined()
		expect(first!.title).toBe('Скоро пара: Математика')
		expect(first!.at.getHours()).toBe(8)
		expect(first!.at.getMinutes()).toBe(60 - FIRST_LESSON_REMINDER_OFFSET_MINUTES)
	})

	it('reminds 15 minutes before lessons after a regular break', () => {
		const drafts = buildLessonReminderDrafts(DAY_WITH_LUNCH, EARLY_MORNING)
		const second = drafts.find(
			d => d.extra.lesson === 2 && !d.title.startsWith('Перерыв'),
		)

		expect(second).toBeDefined()
		expect(second!.at.getHours()).toBe(10)
		expect(second!.at.getMinutes()).toBe(40 - LESSON_REMINDER_OFFSET_MINUTES)
	})

	it('schedules a break notification at the start of a lunch break', () => {
		const drafts = buildLessonReminderDrafts(DAY_WITH_LUNCH, EARLY_MORNING)
		const lunchNotif = drafts.find(
			d => d.extra.lesson === 3 && d.title.startsWith('Перерыв'),
		)

		expect(lunchNotif).toBeDefined()
		expect(lunchNotif!.title).toBe('Перерыв 30 мин')
		expect(lunchNotif!.body).toContain('Можно поесть')
		expect(lunchNotif!.body).toContain('12:40')
		expect(lunchNotif!.body).toContain('Химия')
		expect(lunchNotif!.at.getHours()).toBe(12)
		expect(lunchNotif!.at.getMinutes()).toBe(10)
	})

	it('reminds 10 minutes before a lesson that follows a lunch break', () => {
		const drafts = buildLessonReminderDrafts(DAY_WITH_LUNCH, EARLY_MORNING)
		const reminder = drafts.find(
			d => d.extra.lesson === 3 && !d.title.startsWith('Перерыв'),
		)

		expect(reminder).toBeDefined()
		expect(reminder!.title).toBe('Скоро пара: Химия')
		expect(reminder!.at.getHours()).toBe(12)
		expect(reminder!.at.getMinutes()).toBe(40 - POST_LUNCH_LESSON_REMINDER_OFFSET_MINUTES)
	})

	it('does not detect a lunch break when all gaps are similar short breaks', () => {
		const lessons: LessonItem[] = [
			{
				date: '2026-04-23',
				lesson: 1,
				started_at: '09:00',
				finished_at: '10:30',
				teacher: 'A',
				subject: 'Math',
				room: '1',
			},
			{
				date: '2026-04-23',
				lesson: 2,
				started_at: '10:40',
				finished_at: '12:10',
				teacher: 'B',
				subject: 'Phys',
				room: '2',
			},
			{
				date: '2026-04-23',
				lesson: 3,
				started_at: '12:20',
				finished_at: '13:50',
				teacher: 'C',
				subject: 'Chem',
				room: '3',
			},
		]
		const drafts = buildLessonReminderDrafts(lessons, EARLY_MORNING)

		expect(drafts.filter(d => d.title.startsWith('Перерыв'))).toHaveLength(0)
		expect(drafts.filter(d => !d.title.startsWith('Перерыв'))).toHaveLength(3)
	})

	it('detects a single long break as lunch when there is only one gap in the day', () => {
		const lessons: LessonItem[] = [
			{
				date: '2026-04-23',
				lesson: 1,
				started_at: '09:00',
				finished_at: '10:30',
				teacher: 'A',
				subject: 'Math',
				room: '1',
			},
			{
				date: '2026-04-23',
				lesson: 2,
				started_at: '11:00',
				finished_at: '12:30',
				teacher: 'B',
				subject: 'Phys',
				room: '2',
			},
		]
		const drafts = buildLessonReminderDrafts(lessons, EARLY_MORNING)

		expect(drafts.some(d => d.title === 'Перерыв 30 мин')).toBe(true)
	})

	it('skips reminders that have already passed', () => {
		const drafts = buildLessonReminderDrafts(
			DAY_WITH_LUNCH,
			new Date('2026-04-23T08:31:00'),
		)
		const lessonNumbers = drafts.map(d => d.extra.lesson)

		expect(lessonNumbers).not.toContain(1)
		expect(lessonNumbers).toContain(2)
		expect(lessonNumbers).toContain(3)
	})
})
