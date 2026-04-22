/**
 * Возвращает правильную форму слова в зависимости от числа
 * @param count - количество предметов
 * @param singular - форма для 1 предмета (напр. "материал")
 * @param twoFour - форма для 2-4 предметов (напр. "материала")
 * @param many - форма для 5+ предметов (напр. "материалов")
 * @returns правильная форма слова
 */
export function pluralize(
	count: number,
	singular: string,
	twoFour: string,
	many: string,
): string {
	const mod10 = count % 10
	const mod100 = count % 100

	if (mod100 >= 11 && mod100 <= 19) return many
	if (mod10 === 1) return singular
	if (mod10 >= 2 && mod10 <= 4) return twoFour
	return many
}

/**
 * Специализированная версия для материалов
 */
export function pluralizeCount(n: number): string {
	return pluralize(n, 'материал', 'материала', 'материалов')
}

export function pluralizeLessons(n: number): string {
	return `${n} ${pluralize(n, 'пара', 'пары', 'пар')}`
}

export function pluralizeGrades(n: number): string {
	return pluralize(n, 'оценка', 'оценки', 'оценок')
}
