import { describe, expect, it } from 'vitest'
import {
	compareVersions,
	isRemoteReleaseNewer,
	parseChangelogItems,
	toChangelogFeedEntry,
} from '../appRelease'

describe('compareVersions', () => {
	it('равные версии → 0', () => {
		expect(compareVersions('1.0.0', '1.0.0')).toBe(0)
		expect(compareVersions('2.5.3', '2.5.3')).toBe(0)
	})

	it('левая больше → 1', () => {
		expect(compareVersions('2.0.0', '1.9.9')).toBe(1)
		expect(compareVersions('1.1.0', '1.0.9')).toBe(1)
		expect(compareVersions('1.0.1', '1.0.0')).toBe(1)
	})

	it('правая больше → -1', () => {
		expect(compareVersions('1.0.0', '1.0.1')).toBe(-1)
		expect(compareVersions('1.9.9', '2.0.0')).toBe(-1)
	})

	it('разная длина версий', () => {
		expect(compareVersions('1.0', '1.0.0')).toBe(0)
		expect(compareVersions('1.1', '1.0.9')).toBe(1)
		expect(compareVersions('1.0', '1.0.1')).toBe(-1)
	})

	it('двузначные числа в версии', () => {
		expect(compareVersions('1.21', '1.9')).toBe(1)
		expect(compareVersions('1.9', '1.21')).toBe(-1)
	})
})

describe('isRemoteReleaseNewer', () => {
	const base = { currentBuild: 10, currentVersion: '1.0.0' }

	it('новее по build → true', () => {
		expect(isRemoteReleaseNewer({ ...base, serverBuild: 11, serverVersion: '1.0.0' })).toBe(true)
	})

	it('старее по build → false', () => {
		expect(isRemoteReleaseNewer({ ...base, serverBuild: 9, serverVersion: '1.0.0' })).toBe(false)
	})

	it('одинаковый build, новее версия → true', () => {
		expect(isRemoteReleaseNewer({ ...base, serverBuild: 10, serverVersion: '1.0.1' })).toBe(true)
	})

	it('одинаковый build, старее версия → false', () => {
		expect(isRemoteReleaseNewer({ ...base, serverBuild: 10, serverVersion: '0.9.9' })).toBe(false)
	})

	it('полностью совпадает → false', () => {
		expect(isRemoteReleaseNewer({ ...base, serverBuild: 10, serverVersion: '1.0.0' })).toBe(false)
	})

	it('build=0 у обоих, сравнение по версии', () => {
		expect(isRemoteReleaseNewer({ currentBuild: 0, currentVersion: '1.0.0', serverBuild: 0, serverVersion: '1.1.0' })).toBe(true)
		expect(isRemoteReleaseNewer({ currentBuild: 0, currentVersion: '1.1.0', serverBuild: 0, serverVersion: '1.0.0' })).toBe(false)
	})
})

describe('parseChangelogItems', () => {
	it('разбирает строки с дефисом', () => {
		expect(parseChangelogItems('- Фикс бага\n- Новая фича')).toEqual(['Фикс бага', 'Новая фича'])
	})

	it('разбирает строки со звёздочкой и точкой', () => {
		expect(parseChangelogItems('* Пункт 1\n• Пункт 2')).toEqual(['Пункт 1', 'Пункт 2'])
	})

	it('игнорирует пустые строки', () => {
		expect(parseChangelogItems('- Пункт\n\n- Другой')).toEqual(['Пункт', 'Другой'])
	})

	it('пустая строка → fallback', () => {
		expect(parseChangelogItems('')).toEqual(['Описание обновления скоро появится'])
		expect(parseChangelogItems('   ')).toEqual(['Описание обновления скоро появится'])
	})

	it('строки без маркеров остаются как есть', () => {
		expect(parseChangelogItems('Просто текст')).toEqual(['Просто текст'])
	})
})

describe('toChangelogFeedEntry', () => {
	const release = { version: '1.2.3', build: 5, apk_url: 'http://example.com/app.apk', changelog: '- Фикс' }

	it('формирует корректный id', () => {
		expect(toChangelogFeedEntry(release).id).toBe('v1.2.3-b5')
	})

	it('парсит changelog в items', () => {
		expect(toChangelogFeedEntry(release).items).toEqual(['Фикс'])
	})

	it('пробрасывает дату если передана', () => {
		expect(toChangelogFeedEntry(release, '2025-01-01').date).toBe('2025-01-01')
	})

	it('дата undefined если не передана', () => {
		expect(toChangelogFeedEntry(release).date).toBeUndefined()
	})
})
