const preloaded = new Set<string>()

const API_ORIGIN = 'https://msapi-top-journal.ru'

export function fixUrl(url: string | null | undefined): string | null {
	if (!url) return null

	// Relative path like /files/<token> — prepend API origin
	if (url.startsWith('/')) {
		return `${API_ORIGIN}${url}`
	}

	try {
		const parsed = new URL(url)
		if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
			const base = new URL(API_ORIGIN)
			parsed.protocol = base.protocol
			parsed.hostname = base.hostname
			parsed.port = ''
			return parsed.toString()
		}
	} catch {}

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
