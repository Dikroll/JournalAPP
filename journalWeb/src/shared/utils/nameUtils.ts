/**
 * Возвращает инициалы из полного имени.
 * "Иванов Иван Иванович" → "ИИ"
 * "John Doe" → "JD"
 */
export function getInitials(fullName: string): string {
	return fullName
		.trim()
		.split(/\s+/)
		.map(n => n[0])
		.join('')
		.slice(0, 2)
		.toUpperCase()
}

/**
 * Сокращает ФИО до "Фамилия И.О."
 * "Иванов Иван Петрович" → "Иванов И.П."
 */
export function getShortName(fullName: string): string {
	const parts = fullName.trim().split(/\s+/)
	return parts.map((p, i) => (i === 0 ? p : p[0] + '.')).join(' ')
}
