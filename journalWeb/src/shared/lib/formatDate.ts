/**
 * Форматирует дату в формате "день месяц" (напр. "5 апр")
 */
export function formatDateCompact(date: string | Date): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date
	return dateObj.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'short',
	})
}

/**
 * Получить полную дату в русском формате
 */
export function formatDateFull(date: string | Date): string {
	const dateObj = typeof date === 'string' ? new Date(date) : date
	return dateObj.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}
