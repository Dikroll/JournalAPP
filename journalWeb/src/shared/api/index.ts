import { useAuthStore } from '@/features/auth'
import type { InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { API_BASE_URL } from '../config/env'

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const token = useAuthStore.getState().token
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	if (config.data instanceof FormData) {
		delete config.headers['Content-Type']
	}
	return config
})

api.interceptors.response.use(
	res => res,
	async err => {
		const status = err.response?.status
		if (!status) {
			return Promise.reject(err)
		}
		if (status === 401) {
			useAuthStore.getState().logout()
		}
		return Promise.reject(err)
	},
)
