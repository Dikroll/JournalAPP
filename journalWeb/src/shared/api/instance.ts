import { API_BASE_URL } from '@/shared/config/env'
import axios from 'axios'

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: { 
		"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ru_RU, ru",
    "Content-Type": "application/json",
    "Origin": "https://journal.top-academy.ru",
    "Referer": "https://journal.top-academy.ru/",
	 },
})

api.interceptors.request.use((config: { headers: { Authorization: string } }) => {
	const token = localStorage.getItem('access_token')
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

api.interceptors.response.use(
	res => res,
	err => {
		if (err.response?.status === 401) {
			localStorage.removeItem('access_token')
			window.location.hash = '#/login'
		}
		return Promise.reject(err)
	},
)
