import type { GradeEntry } from '@/entities/grades'
import { describe, expect, it } from 'vitest'
import {
	computeAttendance,
	computeByPeriod,
	computeByType,
	computeDistribution,
	computeSubjectStats,
	computeTotals,
} from '../subjectStats'

function entry(
	date: string,
	attended: GradeEntry['attended'],
	marks: Partial<GradeEntry['marks']> | null = null,
	lesson_number = 1,
): GradeEntry {
	return {
		date,
		lesson_number,
		attended,
		spec_id: 1,
		spec_name: 'T',
		teacher: 'T',
		theme: '',
		marks: marks === null
			? null
			: {
				control: marks.control ?? null,
				homework: marks.homework ?? null,
				lab: marks.lab ?? null,
				classwork: marks.classwork ?? null,
				practical: marks.practical ?? null,
				final: marks.final ?? null,
			},
	}
}

describe('computeTotals', () => {
	it('zero for empty', () => {
		expect(computeTotals([])).toEqual({ lessons: 0, withMarks: 0, withoutMarks: 0 })
	})

	it('counts marks vs no-marks', () => {
		const entries = [
			entry('2026-01-01', 'present', { homework: 4 }),
			entry('2026-01-02', 'present', null),
			entry('2026-01-03', 'absent', null),
		]
		expect(computeTotals(entries)).toEqual({ lessons: 3, withMarks: 1, withoutMarks: 2 })
	})
})

describe('computeAttendance', () => {
	it('zero-safe on empty', () => {
		expect(computeAttendance([])).toEqual({ present: 0, late: 0, absent: 0, ratePercent: 0 })
	})

	it('counts each status + computes rate', () => {
		const entries = [
			entry('2026-01-01', 'present'),
			entry('2026-01-02', 'late'),
			entry('2026-01-03', 'absent'),
			entry('2026-01-04', 'present'),
		]
		const res = computeAttendance(entries)
		expect(res).toEqual({ present: 2, late: 1, absent: 1, ratePercent: 75 })
	})
})

describe('computeDistribution', () => {
	it('all zeros on empty', () => {
		expect(computeDistribution([])).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
	})

	it('rounds float marks to integer buckets', () => {
		const entries = [
			entry('2026-01-01', 'present', { homework: 5 }),
			entry('2026-01-02', 'present', { control: 4, homework: 4 }),
			entry('2026-01-03', 'present', { lab: 3 }),
			entry('2026-01-04', 'present', { practical: 2 }),
		]
		expect(computeDistribution(entries)).toEqual({
			1: 0,
			2: 1,
			3: 1,
			4: 2,
			5: 1,
		})
	})

	it('ignores null/zero marks', () => {
		const entries = [entry('2026-01-01', 'present', { homework: 0 })]
		expect(computeDistribution(entries)).toEqual({
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
		})
	})
})

describe('computeByType', () => {
	it('empty array on no entries', () => {
		expect(computeByType([])).toEqual([])
	})

	it('groups and averages per type', () => {
		const entries = [
			entry('2026-01-01', 'present', { homework: 4 }),
			entry('2026-01-02', 'present', { homework: 5 }),
			entry('2026-01-03', 'present', { control: 3 }),
		]
		const result = computeByType(entries)
		const hw = result.find(r => r.type === 'homework')!
		const ctrl = result.find(r => r.type === 'control')!
		expect(hw).toEqual({ type: 'homework', count: 2, avg: 4.5 })
		expect(ctrl).toEqual({ type: 'control', count: 1, avg: 3 })
		expect(result.find(r => r.type === 'lab')).toBeUndefined()
	})
})

describe('computeByPeriod (week)', () => {
	it('empty array on no entries', () => {
		expect(computeByPeriod([], 'week')).toEqual([])
	})

	it('groups by ISO week', () => {
		const entries = [
			entry('2026-01-05', 'present', { homework: 4 }),
			entry('2026-01-06', 'present', { homework: 5 }),
			entry('2026-01-12', 'present', { homework: 3 }),
		]
		const periods = computeByPeriod(entries, 'week')
		expect(periods).toHaveLength(2)
		expect(periods[0].count).toBe(2)
		expect(periods[0].avg).toBe(4.5)
		expect(periods[1].count).toBe(1)
		expect(periods[1].avg).toBe(3)
	})
})

describe('computeByPeriod (month)', () => {
	it('groups by YYYY-MM and labels in russian short', () => {
		const entries = [
			entry('2026-01-05', 'present', { homework: 4 }),
			entry('2026-02-03', 'present', { homework: 5 }),
		]
		const periods = computeByPeriod(entries, 'month')
		expect(periods).toHaveLength(2)
		expect(periods[0].label).toMatch(/янв/i)
		expect(periods[1].label).toMatch(/фев/i)
	})
})

describe('computeSubjectStats', () => {
	it('wraps all sub-computations', () => {
		const entries = [
			entry('2026-01-05', 'present', { homework: 4 }),
			entry('2026-01-06', 'late', { homework: 5 }),
		]
		const res = computeSubjectStats(entries)
		expect(res.total.lessons).toBe(2)
		expect(res.attendance.present).toBe(1)
		expect(res.attendance.late).toBe(1)
		expect(res.distribution[4]).toBe(1)
		expect(res.distribution[5]).toBe(1)
		expect(res.byType).toHaveLength(1)
		expect(res.byPeriod.length).toBeGreaterThan(0)
	})
})
