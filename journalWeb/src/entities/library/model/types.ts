export type MaterialType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
	1: 'ДЗ',
	2: 'Уроки',
	3: 'Практика',
	4: 'Библиотека',
	5: 'Видео',
	6: 'Презентации',
	7: 'Тесты',
	8: 'Статьи',
}

/** Маппинг числового типа → ключ в ответе /library/counters */
export const MATERIAL_TYPE_TO_COUNTER_KEY = {
	1: 'homeworks',
	2: 'lessons',
	3: 'practical',
	4: 'books',
	5: 'videos',
	6: 'other',
	7: 'tests',
	8: 'articles',
} as const satisfies Record<MaterialType, keyof LibraryCounters>

export interface LibraryTypeCount {
	total: number
	new: number
	recommended: number
}

export interface LibraryCounters {
	homeworks: LibraryTypeCount
	lessons: LibraryTypeCount
	practical: LibraryTypeCount
	books: LibraryTypeCount
	videos: LibraryTypeCount
	other: LibraryTypeCount
	tests: LibraryTypeCount
	articles: LibraryTypeCount
}

export interface LibraryMaterial {
	material_id: number
	theme: string
	description: string
	material_type: MaterialType
	type_name: string
	spec_id: number
	spec_name: string
	date: string
	week: number
	public_week: number
	is_new: boolean
	/** Embed / внешняя ссылка (YouTube embed, LinkedIn...). Не FS. */
	url: string | null
	/** FS-файл, проксирован через /files/<token> */
	link: string | null
	download_url: string | null
	cover_image: string | null
}

export interface LibrarySpec {
	id: number
	name: string
	short_name?: string
}

export type LibraryLoadingState = 'idle' | 'loading' | 'success' | 'error'
