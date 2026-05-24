import { describe, expect, it } from 'vitest'
import { pluralize, pluralizeCount } from '../pluralize'

describe('pluralize', () => {
	const forms: [string, string, string] = ['материал', 'материала', 'материалов']

	it('1, 21, 31, 101 → singular', () => {
		expect(pluralize(1, ...forms)).toBe('материал')
		expect(pluralize(21, ...forms)).toBe('материал')
		expect(pluralize(31, ...forms)).toBe('материал')
		expect(pluralize(101, ...forms)).toBe('материал')
	})

	it('2, 3, 4, 22, 23, 24 → twoFour', () => {
		expect(pluralize(2, ...forms)).toBe('материала')
		expect(pluralize(3, ...forms)).toBe('материала')
		expect(pluralize(4, ...forms)).toBe('материала')
		expect(pluralize(22, ...forms)).toBe('материала')
		expect(pluralize(24, ...forms)).toBe('материала')
	})

	it('5-20 → many (исключение для подростков)', () => {
		expect(pluralize(5, ...forms)).toBe('материалов')
		expect(pluralize(11, ...forms)).toBe('материалов')
		expect(pluralize(12, ...forms)).toBe('материалов')
		expect(pluralize(19, ...forms)).toBe('материалов')
		expect(pluralize(20, ...forms)).toBe('материалов')
	})

	it('11-19 всегда many, даже если заканчиваются на 1-4', () => {
		expect(pluralize(11, ...forms)).toBe('материалов')
		expect(pluralize(12, ...forms)).toBe('материалов')
		expect(pluralize(13, ...forms)).toBe('материалов')
		expect(pluralize(14, ...forms)).toBe('материалов')
	})

	it('0, 100, 1000 → many', () => {
		expect(pluralize(0, ...forms)).toBe('материалов')
		expect(pluralize(100, ...forms)).toBe('материалов')
		expect(pluralize(1000, ...forms)).toBe('материалов')
	})
})

describe('pluralizeCount', () => {
	it('1 материал', () => expect(pluralizeCount(1)).toBe('материал'))
	it('2 материала', () => expect(pluralizeCount(2)).toBe('материала'))
	it('5 материалов', () => expect(pluralizeCount(5)).toBe('материалов'))
	it('11 материалов', () => expect(pluralizeCount(11)).toBe('материалов'))
	it('21 материал', () => expect(pluralizeCount(21)).toBe('материал'))
})
