import { userApi, useUserStore } from '@/entities/user'
import { resetAllAppState } from '@/shared/lib'
import { pageConfig } from '@/shared/config'
import { fixUrl } from '@/shared/lib/imageCache'
import { useRef, useState } from 'react'
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
	const saveAccount = useAuthStore(s => s.saveAccount)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const setUser = useUserStore(s => s.setUser)
	const navigate = useNavigate()

	const submittingRef = useRef(false)

	const isAddingAccount = window.location.hash.includes('addAccount=true')
	if (hasHydrated && isAuthenticated && !isAddingAccount) {
		navigate('/', { replace: true })
	}

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (submittingRef.current) return
		submittingRef.current = true

		if (!username.trim()) {
			setError('Введите логин')
			submittingRef.current = false
			return
		}
		if (!password) {
			setError('Введите пароль')
			submittingRef.current = false
			return
		}

		setError(null)
		setLoading(true)

		const payload: LoginRequest = { username: username.trim(), password }

		try {
			const { access_token } = await authApi.login(payload)

			if (isAddingAccount) {
				resetAllAppState({
					resetAuth: false,
					resetTheme: false,
					resetOnboarding: false,
				})
			}

			setToken(access_token, username.trim())

			try {
				const userData = await userApi.getMe()
				setUser(userData)
				saveAccount({
					username: username.trim(),
					token: access_token,
					fullName: userData.full_name,
					groupName: userData.group.name,
					avatarUrl: fixUrl(userData.photo_url),
				})
			} catch {}

			navigate(pageConfig.home, { replace: true })
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
			submittingRef.current = false
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
