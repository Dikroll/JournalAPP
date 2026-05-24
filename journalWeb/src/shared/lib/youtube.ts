/**
 * YouTube utilities для работы с превью и embed'ами
 * Загружает только thumbnail, iframe монтируется при клике
 * Это предотвращает загрузку Google-скриптов и лишние log_event запросы
 */

export function extractYouTubeId(url: string): string | null {
	// youtu.be/ID?...
	if (url.includes('youtu.be/')) {
		return url.split('youtu.be/')[1]?.split('?')[0] ?? null
	}
	// youtube.com/watch?v=ID
	const match = url.match(/[?&]v=([^&]+)/)
	if (match) return match[1]
	// youtube.com/embed/ID
	if (url.includes('youtube.com/embed/')) {
		return url.split('embed/')[1]?.split('?')[0] ?? null
	}
	return null
}

/**
 * Получить URL thumbnail YouTube видео
 * Это публичный API без авторизации, не вызывает log_event
 */
export function getYouTubeThumbnail(
	url: string,
	quality: 'maxres' | 'hq' | 'medium' = 'hq',
): string | null {
	const id = extractYouTubeId(url)
	if (!id) return null
	return `https://img.youtube.com/vi/${id}/${quality}default.jpg`
}

/**
 * Преобразовать URL в embed
 */
export function toYouTubeEmbed(url: string): string | null {
	const id = extractYouTubeId(url)
	return id ? `https://www.youtube.com/embed/${id}` : null
}

/**
 * Проверить является ли URL YouTube ссылкой
 */
export function isYouTubeUrl(url: string): boolean {
	return extractYouTubeId(url) !== null
}
