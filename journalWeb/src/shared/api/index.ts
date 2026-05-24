import type { InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { API_BASE_URL } from '../config/env'
import { getAuthToken } from '../lib/getAuthToken'

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const token = getAuthToken()
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
		if (!status) return Promise.reject(err)
		if (status === 401) {
			const url = err.config?.url ?? ''
			const isLoginEndpoint = url.includes('/auth/login')
			if (isLoginEndpoint) {
				return Promise.reject(err)
			}
		}
		return Promise.reject(err)
	},
)
