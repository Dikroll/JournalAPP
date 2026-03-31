export type MaterialType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
	1: 'Уроки',
	2: 'Библиотека',
	3: 'Видео',
	4: 'Статьи',
	5: 'Практика',
	6: 'Другое',
	7: 'Тесты',
	8: 'Доп',
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
	link: string
	download_url: string
	cover_image: string
}

export interface LibraryCounters {
	total: number
	new: number
	by_type: Record<MaterialType, number>
}

export interface LibrarySpec {
	id: number
	name: string
	short_name?: string
}

export type LibraryLoadingState = 'idle' | 'loading' | 'success' | 'error'
