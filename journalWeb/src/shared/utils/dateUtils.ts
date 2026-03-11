export function formatDateLong(dateStr: string): string {
	const date = new Date(`${dateStr}T00:00:00`)
	return date.toLocaleDateString('ru-RU', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
	})
}

export function toDateString(year: number, month: number, day: number): string {
	return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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

export function formatDate(raw: string) {
	const d = new Date(raw)
	return d.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}
