import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import { useAuthStore, useHydrationStore } from '../model/store'
import type { LoginRequest } from '../model/types'

export function useLogin() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	const setToken = useAuthStore(s => s.setToken)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const navigate = useNavigate()
	const navigatedRef = useRef(false)

	useEffect(() => {
		if (!hasHydrated) return
		if (isAuthenticated && !navigatedRef.current) {
			navigatedRef.current = true
			navigate('/', { replace: true })
		}
	}, [isAuthenticated, hasHydrated, navigate])

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!username.trim()) {
			setError('Введите логин')
			return
		}
		if (!password) {
			setError('Введите пароль')
			return
		}

		setError(null)
		setLoading(true)

		const payload: LoginRequest = { username: username.trim(), password }

		try {
			const { access_token } = await authApi.login(payload)
			setToken(access_token)
		} catch (err: unknown) {
			const status = (err as { response?: { status?: number } })?.response
				?.status
			const detail = (err as { response?: { data?: { detail?: string } } })
				?.response?.data?.detail

			if (status === 401 || status === 400) {
				setError('Неверный логин или пароль')
			} else if (status === 422) {
				setError('Проверьте правильность введённых данных')
			} else if (status === 429) {
				setError('Слишком много попыток. Подождите минуту')
			} else if (status && status >= 500) {
				setError('Ошибка сервера. Попробуйте позже')
			} else if (!status) {
				setError('Нет соединения с сервером')
			} else {
				setError(detail ?? 'Ошибка входа')
			}
		} finally {
			setLoading(false)
		}
	}

	return {
		username,
		password,
		showPassword,
		error,
		loading,
		setUsername,
		setPassword,
		setShowPassword,
		submit,
	}
}
