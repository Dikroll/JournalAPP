import { userApi, useUserStore } from '@/entities/user'
import { useAuthStore, useHydrationStore } from '@/shared/model/authStore'
import { useEffect } from 'react'

let fetching = false
export function resetInitUserFetch() {
	fetching = false
}

export function useInitUser() {
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const activeUsername = useAuthStore(s => s.activeUsername)
	const setUser = useUserStore(s => s.setUser)

	useEffect(() => {
		if (!hasHydrated) return
		if (!isAuthenticated) return
		if (fetching) return

		fetching = true
		const requestedForUsername = activeUsername

		// SWR: при каждом старте/смене аккаунта перезагружаем /me.
		// Если за время запроса сменили аккаунт — ответ отбрасываем.
		userApi
			.getMe()
			.then(data => {
				if (useAuthStore.getState().activeUsername !== requestedForUsername) return
				setUser(data)
			})
			.catch(err => {
				const status = err?.response?.status
				if (status === 401) {
					console.warn('[useInitUser] 401 from /user/me')
				}
			})
			.finally(() => {
				fetching = false
			})
	}, [hasHydrated, isAuthenticated, activeUsername])
}
