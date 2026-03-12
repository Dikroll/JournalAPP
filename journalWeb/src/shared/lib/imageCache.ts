const preloaded = new Set<string>()

// Всегда реальный домен API — даже в dev где API_BASE_URL = '/api'
const API_ORIGIN = 'https://msapi-top-journal.ru'

/**
 * Бэкенд возвращает photo_url с localhost:8000 вместо реального хоста.
 * Заменяем на реальный API домен напрямую — без proxy.
 */
export function fixUrl(url: string | null | undefined): string | null {
	if (!url) return null

	try {
		const parsed = new URL(url)
		if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
			const base = new URL(API_ORIGIN)
			parsed.protocol = base.protocol
			parsed.hostname = base.hostname
			parsed.port = ''
			return parsed.toString()
		}
	} catch {
		// не валидный URL — вернём как есть
	}

	return url
}

export function preloadImages(urls: (string | null | undefined)[]) {
	urls.forEach(url => {
		const fixed = fixUrl(url)
		if (!fixed || preloaded.has(fixed)) return
		preloaded.add(fixed)
		const img = new Image()
		img.src = fixed
	})
}

export function getCachedImageUrl(
	url: string | null | undefined,
): string | null {
	return fixUrl(url)
}
