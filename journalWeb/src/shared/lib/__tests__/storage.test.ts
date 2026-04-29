import { afterEach, describe, expect, it } from 'vitest'
import { storage } from '../storage'

afterEach(() => {
	localStorage.clear()
})

describe('storage.set / storage.get', () => {
	it('сохраняет и возвращает данные', () => {
		storage.set('key', { name: 'test' })
		expect(storage.get('key')).toEqual({ name: 'test' })
	})

	it('возвращает null для несуществующего ключа', () => {
		expect(storage.get('missing')).toBeNull()
	})

	it('возвращает null если ttl истёк', () => {
		// Вставляем запись с уже истёкшим cachedAt
		const expired = { data: 'old', cachedAt: Date.now() - 7200 * 1000, ttl: 3600 }
		localStorage.setItem('expired', JSON.stringify(expired))
		expect(storage.get('expired')).toBeNull()
	})

	it('возвращает данные если ttl не истёк', () => {
		storage.set('fresh', 42, 3600)
		expect(storage.get('fresh')).toBe(42)
	})

	it('перезаписывает существующий ключ', () => {
		storage.set('key', 'first')
		storage.set('key', 'second')
		expect(storage.get('key')).toBe('second')
	})
})

describe('storage.getCachedAt', () => {
	it('возвращает timestamp после set', () => {
		const before = Date.now()
		storage.set('ts', 'value')
		const after = Date.now()
		const cachedAt = storage.getCachedAt('ts')
		expect(cachedAt).not.toBeNull()
		expect(cachedAt!).toBeGreaterThanOrEqual(before)
		expect(cachedAt!).toBeLessThanOrEqual(after)
	})

	it('null для несуществующего ключа', () => {
		expect(storage.getCachedAt('none')).toBeNull()
	})
})

describe('storage.remove', () => {
	it('удаляет ключ', () => {
		storage.set('del', 'value')
		storage.remove('del')
		expect(storage.get('del')).toBeNull()
	})

	it('не падает если ключ не существует', () => {
		expect(() => storage.remove('nonexistent')).not.toThrow()
	})
})

describe('storage.clear', () => {
	it('без префикса очищает всё', () => {
		storage.set('a', 1)
		storage.set('b', 2)
		storage.clear()
		expect(storage.get('a')).toBeNull()
		expect(storage.get('b')).toBeNull()
	})

	it('с префиксом удаляет только совпадающие ключи', () => {
		storage.set('cache:grades', [1, 2])
		storage.set('cache:homework', [3, 4])
		storage.set('other:key', 'keep')
		storage.clear('cache:')
		expect(storage.get('cache:grades')).toBeNull()
		expect(storage.get('cache:homework')).toBeNull()
		expect(localStorage.getItem('other:key')).not.toBeNull()
	})
})
