export const RU_MONTHS = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь',
] as const

export const RU_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

export function formatDateLong(dateStr: string): string {
	const date = new Date(`${dateStr}T00:00:00`)
	return date.toLocaleDateString('ru-RU', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
	})
}

export function toDateString(year: number, month: number, day: number): string {
	return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
		2,
		'0',
	)}`
}

export function getTodayString(): string {
	const now = new Date()
	return toDateString(now.getFullYear(), now.getMonth(), now.getDate())
}

export function formatMonthShort(dateStr: string): string {
	return new Date(`${dateStr}T00:00:00`)
		.toLocaleDateString('ru-RU', { month: 'short' })
		.replace('.', '')
}

export function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
	return (new Date(year, month, 1).getDay() + 6) % 7
}

export function formatDate(raw: string) {
	const d = new Date(raw)
	return d.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

export function formatDateShort(dateStr: string): string {
	return new Date(`${dateStr}T00:00:00`).toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
}
export function formatDateWithWeekday(dateStr: string): string {
	return new Date(`${dateStr}T00:00:00`).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		weekday: 'long',
	})
}

export function getDaysUntilDeadline(deadline: string): number | null {
	try {
		const deadlineDate = new Date(deadline)
		if (isNaN(deadlineDate.getTime())) return null
		const now = new Date()
		const diffMs = deadlineDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
		return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
	} catch {
		return null
	}
}

export function formatDateRelative(dateStr: string): string {
	const date = new Date(`${dateStr}T00:00:00`)
	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(today.getDate() - 1)
	if (date.toDateString() === today.toDateString()) return 'Сегодня'
	if (date.toDateString() === yesterday.toDateString()) return 'Вчера'
	return date.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		weekday: 'short',
	})
}

/** Форматирует ISO дату в формате "09.04" (dd.MM) */
export function formatDayMonth(dateStr: string): string {
	const d = new Date(`${dateStr}T00:00:00`)
	return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

/** Форматирует дату в формате "5 апр" */
export function formatDateCompact(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

/** Форматирует дату в формате "5 апреля 2025" */
export function formatDateFull(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date
	return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
