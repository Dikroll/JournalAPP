import type { GradeEntry } from '@/entities/grades'
import { describe, expect, it } from 'vitest'
import { buildGoalsWidgetPayload, computeDistribution } from '../payload'

const ENTRY = (
	marks: Partial<GradeEntry['marks'] & object> | null,
): Pick<GradeEntry, 'marks'> => ({
	marks: marks
		? ({
				control: null,
				homework: null,
				lab: null,
				classwork: null,
				practical: null,
				final: null,
				...marks,
			} as GradeEntry['marks'])
		: null,
})

const SAFE_SUMMARY = {
	risk: 'safe' as const,
	atRiskCount: 0,
	totalSubjectsWithGoals: 0,
	forecast: null,
	target: null,
}

describe('computeDistribution', () => {
	it('counts marks 1..5 across all categories', () => {
		const dist = computeDistribution([
			ENTRY({ control: 5, homework: 4 }),
			ENTRY({ classwork: 5, practical: 3 }),
			ENTRY(null),
			ENTRY({ lab: 1, final: 2 }),
		])
		expect(dist).toEqual({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 2 })
	})

	it('ignores null marks and out-of-range values', () => {
		const dist = computeDistribution([
			ENTRY({ control: 0 as unknown as number }),
			ENTRY({ homework: 6 as unknown as number }),
			ENTRY({ lab: 4 }),
		])
		expect(dist).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 })
	})
})

describe('buildGoalsWidgetPayload', () => {
	it('returns zero distribution for empty input', () => {
		const payload = buildGoalsWidgetPayload({
			avg: null,
			attendance: null,
			gradeEntries: [],
			summary: { ...SAFE_SUMMARY, risk: 'no_goal' },
		})
		expect(payload.totalMarks).toBe(0)
		expect(payload.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
		expect(payload.avg).toBeNull()
		expect(payload.attendance).toBeNull()
	})

	it('rounds avg to 2 decimals and attendance to integer', () => {
		const payload = buildGoalsWidgetPayload({
			avg: 4.4567,
			attendance: 92.6,
			gradeEntries: [],
			summary: SAFE_SUMMARY,
		})
		expect(payload.avg).toBe(4.46)
		expect(payload.attendance).toBe(93)
	})

	it('preserves summary fields and totalMarks from distribution', () => {
		const payload = buildGoalsWidgetPayload({
			avg: 4,
			attendance: 100,
			gradeEntries: [ENTRY({ control: 5 }), ENTRY({ homework: 4 })],
			summary: {
				risk: 'watch',
				atRiskCount: 2,
				totalSubjectsWithGoals: 4,
				forecast: 4.1,
				target: 4.5,
			},
		})
		expect(payload.totalMarks).toBe(2)
		expect(payload.summary.atRiskCount).toBe(2)
		expect(payload.summary.forecast).toBe(4.1)
		expect(payload.summary.target).toBe(4.5)
	})
})
