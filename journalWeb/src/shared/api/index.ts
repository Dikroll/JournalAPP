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
	const token = localStorage.getItem('access_token')
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
	err => {
		if (err.response?.status === 401) {
			useAuthStore.getState().logout()
			window.location.hash = '#/login'
		}
		return Promise.reject(err)
	},
)
