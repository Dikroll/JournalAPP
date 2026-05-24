import { describe, expect, it } from 'vitest'
import { isCacheValid } from '../isCacheValid'

describe('isCacheValid', () => {
	it('null loadedAt → false', () => {
		expect(isCacheValid(null, 60_000)).toBe(false)
	})

	it('свежий кэш → true', () => {
		expect(isCacheValid(Date.now() - 1000, 60_000)).toBe(true)
	})

	it('просроченный кэш → false', () => {
		expect(isCacheValid(Date.now() - 120_000, 60_000)).toBe(false)
	})

	it('ровно на границе ttl → false', () => {
		expect(isCacheValid(Date.now() - 60_000, 60_000)).toBe(false)
	})

	it('ttl = 0 → всегда false', () => {
		expect(isCacheValid(Date.now(), 0)).toBe(false)
	})
})
