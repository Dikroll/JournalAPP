import type { GradeEntry } from '@/entities/grades'
import { describe, expect, it } from 'vitest'
import { computeForecast, computeRisk, computeTrend, currentAverage } from '../forecast'

function entry(date: string, marks: Partial<GradeEntry['marks']> | null, attended: GradeEntry['attended'] = 'present'): GradeEntry {
	return {
		date,
		lesson_number: 1,
		attended,
		spec_id: 1,
		spec_name: 'Test',
		teacher: 'T',
		theme: '',
		marks: marks === null
			? null
			: {
				control: marks?.control ?? null,
				homework: marks?.homework ?? null,
				lab: marks?.lab ?? null,
				classwork: marks?.classwork ?? null,
				practical: marks?.practical ?? null,
				final: marks?.final ?? null,
			},
	}
}

describe('currentAverage', () => {
	it('null on empty', () => {
		expect(currentAverage([])).toBeNull()
	})

	it('null when no marks at all', () => {
		expect(currentAverage([entry('2026-01-01', null, 'absent')])).toBeNull()
	})

	it('flat average across all mark types', () => {
		const entries = [
			entry('2026-01-01', { homework: 5, control: 4 }),
			entry('2026-01-02', { lab: 3 }),
		]
		expect(currentAverage(entries)).toBeCloseTo((5 + 4 + 3) / 3)
	})

	it('ignores zero marks', () => {
		const entries = [entry('2026-01-01', { homework: 0, control: 5 })]
		expect(currentAverage(entries)).toBe(5)
	})
})

describe('computeTrend', () => {
	it('flat when fewer than 4 marks', () => {
		const entries = [entry('2026-01-01', { homework: 3 })]
		expect(computeTrend(entries)).toBe('flat')
	})

	it('up when last 4 avg exceeds prev 4 avg by > 0.3', () => {
		const entries = [
			entry('2026-01-01', { homework: 3 }),
			entry('2026-01-02', { homework: 3 }),
			entry('2026-01-03', { homework: 3 }),
			entry('2026-01-04', { homework: 3 }),
			entry('2026-01-05', { homework: 5 }),
			entry('2026-01-06', { homework: 5 }),
			entry('2026-01-07', { homework: 5 }),
			entry('2026-01-08', { homework: 5 }),
		]
		expect(computeTrend(entries)).toBe('up')
	})

	it('down when last 4 avg below prev 4 avg by > 0.3', () => {
		const entries = [
			entry('2026-01-01', { homework: 5 }),
			entry('2026-01-02', { homework: 5 }),
			entry('2026-01-03', { homework: 5 }),
			entry('2026-01-04', { homework: 5 }),
			entry('2026-01-05', { homework: 3 }),
			entry('2026-01-06', { homework: 3 }),
			entry('2026-01-07', { homework: 3 }),
			entry('2026-01-08', { homework: 3 }),
		]
		expect(computeTrend(entries)).toBe('down')
	})

	it('flat when change within ±0.3', () => {
		const entries = [
			entry('2026-01-01', { homework: 4 }),
			entry('2026-01-02', { homework: 4 }),
			entry('2026-01-03', { homework: 4 }),
			entry('2026-01-04', { homework: 4 }),
			entry('2026-01-05', { homework: 4 }),
			entry('2026-01-06', { homework: 4 }),
			entry('2026-01-07', { homework: 4 }),
			entry('2026-01-08', { homework: 4 }),
		]
		expect(computeTrend(entries)).toBe('flat')
	})
})

describe('computeRisk', () => {
	it('no_goal when target is null', () => {
		expect(computeRisk(null, 4.5)).toBe('no_goal')
	})

	it('no_goal when forecast is null (no data)', () => {
		expect(computeRisk(4, null)).toBe('no_goal')
	})

	it('safe when forecast >= target', () => {
		expect(computeRisk(4, 4)).toBe('safe')
		expect(computeRisk(4, 4.5)).toBe('safe')
	})

	it('watch when forecast in [target-0.3, target)', () => {
		expect(computeRisk(4, 3.75)).toBe('watch')
		expect(computeRisk(5, 4.7)).toBe('watch')
	})

	it('danger when forecast < target-0.3', () => {
		expect(computeRisk(4, 3.5)).toBe('danger')
		expect(computeRisk(5, 4.6)).toBe('danger')
	})
})

describe('computeForecast (integration)', () => {
	it('returns all fields with null-safety', () => {
		const result = computeForecast([], 4)
		expect(result).toEqual({
			currentAvg: null,
			forecast: null,
			trend: 'flat',
			risk: 'no_goal',
			gapToGoal: null,
		})
	})

	it('computes gapToGoal as target - forecast', () => {
		const entries = [entry('2026-01-01', { homework: 4 })]
		const result = computeForecast(entries, 5)
		expect(result.currentAvg).toBe(4)
		expect(result.forecast).toBe(4)
		expect(result.gapToGoal).toBe(1)
	})
})
