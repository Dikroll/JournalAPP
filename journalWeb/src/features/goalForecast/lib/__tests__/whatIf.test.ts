import type { GradeEntry } from '@/entities/grades'
import { describe, expect, it } from 'vitest'
import { whatIfAverage } from '../whatIf'

function entry(marks: Partial<NonNullable<GradeEntry['marks']>>): GradeEntry {
	return {
		date: '2026-01-01',
		lesson_number: 1,
		attended: 'present',
		spec_id: 1,
		spec_name: 'T',
		teacher: 'T',
		theme: '',
		marks: {
			control: marks.control ?? null,
			homework: marks.homework ?? null,
			lab: marks.lab ?? null,
			classwork: marks.classwork ?? null,
			practical: marks.practical ?? null,
			final: marks.final ?? null,
		},
	}
}

describe('whatIfAverage', () => {
	it('returns currentAverage when no future marks', () => {
		const entries = [entry({ homework: 4 }), entry({ control: 5 })]
		expect(whatIfAverage(entries, [])).toBeCloseTo(4.5)
	})

	it('returns null when neither current nor future marks exist', () => {
		expect(whatIfAverage([], [])).toBeNull()
	})

	it('mixes current and future into flat average', () => {
		const entries = [entry({ homework: 4 })]
		const future = [{ type: 'homework' as const, value: 5, repeat: 3 }]
		expect(whatIfAverage(entries, future)).toBeCloseTo(4.75)
	})

	it('handles repeat=0 as no contribution', () => {
		const entries = [entry({ homework: 4 })]
		const future = [{ type: 'homework' as const, value: 5, repeat: 0 }]
		expect(whatIfAverage(entries, future)).toBe(4)
	})

	it('handles future-only (no current marks)', () => {
		const future = [{ type: 'control' as const, value: 5, repeat: 2 }]
		expect(whatIfAverage([], future)).toBe(5)
	})
})
