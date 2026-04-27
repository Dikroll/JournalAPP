import type { FutureExamItem } from '@/entities/exam'
import { describe, expect, it } from 'vitest'
import {
	buildExamReminderDrafts,
	DEFAULT_EXAM_REMINDER_CONFIG,
	type ExamReminderConfig,
} from '../reminderPlanner'

const NOW = new Date('2026-04-23T08:00:00')

const EXAM: FutureExamItem = {
	date: '2026-04-30',
	spec: 'Математика',
	days_left: 7,
}

function makeConfig(overrides: Partial<ExamReminderConfig> = {}): ExamReminderConfig {
	return { ...DEFAULT_EXAM_REMINDER_CONFIG, ...overrides }
}

describe('buildExamReminderDrafts', () => {
	it('returns empty when master is disabled', () => {
		const drafts = buildExamReminderDrafts([EXAM], NOW, makeConfig({ enabled: false }))
		expect(drafts).toEqual([])
	})

	it('schedules a day-before notification at the chosen hour', () => {
		const drafts = buildExamReminderDrafts(
			[EXAM],
			NOW,
			makeConfig({ dailyEnabled: false }),
		)

		expect(drafts).toHaveLength(1)
		expect(drafts[0].title).toBe('Завтра экзамен!')
		expect(drafts[0].body).toContain('Математика')
		expect(drafts[0].body).toContain('Удачи!')
		expect(drafts[0].at.getDate()).toBe(29)
		expect(drafts[0].at.getHours()).toBe(17)
		expect(drafts[0].extra.kind).toBe('exam-day-before')
	})

	it('schedules daily reminders for each day from startDays down to 2', () => {
		const drafts = buildExamReminderDrafts(
			[EXAM],
			NOW,
			makeConfig({ dayBeforeEnabled: false, startDays: 7, frequency: 'daily' }),
		)

		const dailies = drafts.filter(d => d.extra.kind === 'exam-daily')
		expect(dailies).toHaveLength(6)

		const days = dailies
			.map(d => {
				const examDay = new Date('2026-04-30T00:00:00')
				const diff = Math.round(
					(examDay.getTime() - new Date(d.at).setHours(0, 0, 0, 0)) /
						86_400_000,
				)
				return diff
			})
			.sort((a, b) => a - b)
		expect(days).toEqual([2, 3, 4, 5, 6, 7])
	})

	it('schedules every other day for alternate frequency', () => {
		const drafts = buildExamReminderDrafts(
			[EXAM],
			NOW,
			makeConfig({
				dayBeforeEnabled: false,
				startDays: 7,
				frequency: 'alternate',
			}),
		)

		const dailies = drafts.filter(d => d.extra.kind === 'exam-daily')
		const days = dailies
			.map(d => {
				const examDay = new Date('2026-04-30T00:00:00')
				return Math.round(
					(examDay.getTime() - new Date(d.at).setHours(0, 0, 0, 0)) /
						86_400_000,
				)
			})
			.sort((a, b) => a - b)
		expect(days).toEqual([3, 5, 7])
	})

	it('uses notifyHour for all reminders', () => {
		const drafts = buildExamReminderDrafts(
			[EXAM],
			NOW,
			makeConfig({ notifyHour: 19 }),
		)

		expect(drafts.every(d => d.at.getHours() === 19)).toBe(true)
	})

	it('skips exams already in the past', () => {
		const past: FutureExamItem = {
			date: '2026-04-22',
			spec: 'История',
			days_left: -1,
		}
		const drafts = buildExamReminderDrafts([past], NOW)
		expect(drafts).toEqual([])
	})

	it('does not include reminders that have already passed today', () => {
		const exam: FutureExamItem = {
			date: '2026-04-25',
			spec: 'Физика',
			days_left: 2,
		}
		const drafts = buildExamReminderDrafts(
			[exam],
			new Date('2026-04-23T20:00:00'),
			makeConfig({ notifyHour: 17 }),
		)
		const todayDrafts = drafts.filter(d => d.at.getDate() === 23)
		expect(todayDrafts).toHaveLength(0)
	})

	it('produces unique ids for each reminder', () => {
		const drafts = buildExamReminderDrafts([EXAM], NOW)
		const ids = drafts.map(d => d.id)
		expect(new Set(ids).size).toBe(ids.length)
	})
})
