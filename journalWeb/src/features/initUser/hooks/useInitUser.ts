import { userApi, useUserStore } from '@/entities/user'
import { useAuthStore } from '@/features/auth'
import { useHydrationStore } from '@/features/auth/model/store'
import { useEffect } from 'react'

let fetching = false

export function useInitUser() {
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const user = useUserStore(s => s.user)
	const setUser = useUserStore(s => s.setUser)
	const logout = useAuthStore(s => s.logout)

	useEffect(() => {
		if (!hasHydrated) return
		if (!isAuthenticated) return
		if (user) return // уже есть в persist — не трогаем
		if (fetching) return // другой маунт уже фетчит

		fetching = true

		userApi
			.getMe()
			.then(data => {
				setUser(data)
			})
			.catch(err => {
				const status = err?.response?.status
				// Логаутим ТОЛЬКО при явном 401 — не при таймауте или 5xx
				// Таймаут = upstream медленный, не значит что токен протух
				if (status === 401) {
					logout()
				}
			})
			.finally(() => {
				fetching = false
			})
	}, [hasHydrated, isAuthenticated])
}
