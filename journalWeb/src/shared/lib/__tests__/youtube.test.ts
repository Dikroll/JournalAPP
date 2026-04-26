import { describe, expect, it } from 'vitest'
import { extractYouTubeId, getYouTubeThumbnail, isYouTubeUrl, toYouTubeEmbed } from '../youtube'

const VIDEO_ID = 'dQw4w9WgXcQ'

describe('extractYouTubeId', () => {
	it('youtu.be/ID', () => {
		expect(extractYouTubeId(`https://youtu.be/${VIDEO_ID}`)).toBe(VIDEO_ID)
	})

	it('youtu.be/ID?si=...', () => {
		expect(extractYouTubeId(`https://youtu.be/${VIDEO_ID}?si=abc123`)).toBe(VIDEO_ID)
	})

	it('youtube.com/watch?v=ID', () => {
		expect(extractYouTubeId(`https://www.youtube.com/watch?v=${VIDEO_ID}`)).toBe(VIDEO_ID)
	})

	it('youtube.com/watch?v=ID&t=30', () => {
		expect(extractYouTubeId(`https://www.youtube.com/watch?v=${VIDEO_ID}&t=30`)).toBe(VIDEO_ID)
	})

	it('youtube.com/embed/ID', () => {
		expect(extractYouTubeId(`https://www.youtube.com/embed/${VIDEO_ID}`)).toBe(VIDEO_ID)
	})

	it('не YouTube URL → null', () => {
		expect(extractYouTubeId('https://vimeo.com/123456')).toBeNull()
		expect(extractYouTubeId('https://example.com')).toBeNull()
	})
})

describe('getYouTubeThumbnail', () => {
	it('hq (по умолчанию)', () => {
		expect(getYouTubeThumbnail(`https://youtu.be/${VIDEO_ID}`))
			.toBe(`https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`)
	})

	it('maxres качество', () => {
		expect(getYouTubeThumbnail(`https://youtu.be/${VIDEO_ID}`, 'maxres'))
			.toBe(`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`)
	})

	it('medium качество', () => {
		expect(getYouTubeThumbnail(`https://youtu.be/${VIDEO_ID}`, 'medium'))
			.toBe(`https://img.youtube.com/vi/${VIDEO_ID}/mediumdefault.jpg`)
	})

	it('невалидный URL → null', () => {
		expect(getYouTubeThumbnail('https://example.com')).toBeNull()
	})
})

describe('toYouTubeEmbed', () => {
	it('возвращает embed URL', () => {
		expect(toYouTubeEmbed(`https://youtu.be/${VIDEO_ID}`))
			.toBe(`https://www.youtube.com/embed/${VIDEO_ID}`)
	})

	it('невалидный URL → null', () => {
		expect(toYouTubeEmbed('https://example.com')).toBeNull()
	})
})

describe('isYouTubeUrl', () => {
	it('YouTube ссылки → true', () => {
		expect(isYouTubeUrl(`https://youtu.be/${VIDEO_ID}`)).toBe(true)
		expect(isYouTubeUrl(`https://www.youtube.com/watch?v=${VIDEO_ID}`)).toBe(true)
	})

	it('не YouTube → false', () => {
		expect(isYouTubeUrl('https://vimeo.com/123')).toBe(false)
		expect(isYouTubeUrl('https://example.com')).toBe(false)
	})
})
