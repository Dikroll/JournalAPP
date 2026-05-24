/**
 * Материалы с внешними ссылками вместо файлов (или в первую очередь)
 */
const EXTERNAL_LINK_TYPES = new Set([
	4, // Библиотека
	5, // Видео
	6, // Презентации
	8, // Статьи
])

/**
 * Определяет, какой URL использовать для открытия материала
 * Для типов 4,5,6,8 — сначала внешнюю ссылку, потом файл
 * Для остальных — только файл
 */
export function getOpenUrl(
	materialType: number,
	url: string | null,
	link: string | null,
): string | null {
	const hasExternalLink = EXTERNAL_LINK_TYPES.has(materialType)
	return hasExternalLink ? url || link : link
}

/**
 * Проверяет, можно ли открыть материал
 */
export function canOpenMaterial(
	materialType: number,
	url: string | null,
	link: string | null,
): boolean {
	return !!getOpenUrl(materialType, url, link)
}
