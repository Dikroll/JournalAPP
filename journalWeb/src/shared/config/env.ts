export const API_BASE_URL = import.meta.env.DEV
	? '/api'
	: 'https://msapi-top-journal.ru'

export const BACKEND_ORIGIN =
	typeof import.meta.env.VITE_API_BASE_URL === 'string' &&
	import.meta.env.VITE_API_BASE_URL.startsWith('http')
		? import.meta.env.VITE_API_BASE_URL
		: 'https://msapi-top-journal.ru'
