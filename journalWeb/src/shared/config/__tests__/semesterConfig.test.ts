import { describe, expect, it } from 'vitest'
import { SEMESTER_LENGTH_WEEKS, weeksRemainingInSemester } from '../semesterConfig'

describe('semesterConfig', () => {
	it('semester length is 18 weeks', () => {
		expect(SEMESTER_LENGTH_WEEKS).toBe(18)
	})

	it('weeksRemainingInSemester clamps to non-negative', () => {
		expect(weeksRemainingInSemester(20)).toBe(0)
		expect(weeksRemainingInSemester(18)).toBe(0)
		expect(weeksRemainingInSemester(5)).toBe(13)
		expect(weeksRemainingInSemester(0)).toBe(18)
	})

	it('weeksRemainingInSemester handles negative current week', () => {
		expect(weeksRemainingInSemester(-1)).toBe(18)
	})
})
