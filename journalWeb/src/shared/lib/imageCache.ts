import { BACKEND_ORIGIN } from '../config/env'

const API_ORIGIN = BACKEND_ORIGIN

const preloaded = new Set<string>()
const BACKEND_HOST = new URL(API_ORIGIN).hostname

export function fixUrl(url: string | null | undefined): string | null {
	if (!url) return null

	const working = url.trim()
	const original = url
	const withoutLeadingSlashes = working.replace(/^\/+/, '')

	if (withoutLeadingSlashes.startsWith(`${BACKEND_HOST}/`)) {
		return `https://${withoutLeadingSlashes}`
	}

	// Если URL содержит localhost, пытаемся очистить его
	if (working.includes('localhost:') || working.includes('127.0.0.1')) {
		// Ищем домен в строке: msapi-top-journal.ru
		const domainMatch = working.match(/(msapi-top-journal\.ru)/)
		if (domainMatch) {
			const domain = domainMatch[1]
			// Берем всё после домена как путь
			const pathIndex = working.indexOf(domain) + domain.length
			const path = working.substring(pathIndex)
			const result = `https://${domain}${path}`
			return result
		}
	}

	if (working.startsWith('/')) {
		return `${API_ORIGIN}${working}`
	}

	try {
		const parsed = new URL(working)
		const base = new URL(API_ORIGIN)

		// Если хост localhost/127.0.0.1
		if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
			// Пытаемся извлечь реальный домен из пути (например: /msapi-top-journal.ru/files/...)
			const pathParts = parsed.pathname.split('/')
			const potentialDomain = pathParts[1] // это будет 'msapi-top-journal.ru'

			if (potentialDomain && potentialDomain.includes('.')) {
				// Восстанавливаем правильный URL
				const realPath = pathParts.slice(2).join('/') // остаток пути
				return `https://${potentialDomain}/${realPath}`
			}

			// Иначе просто используем API_ORIGIN
			parsed.protocol = base.protocol
			parsed.hostname = base.hostname
			parsed.port = ''
			return parsed.toString()
		}
	} catch {
		return original
	}

	return working
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
