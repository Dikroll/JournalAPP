import { userApi, useUserStore } from '@/entities/user'
import { useAuthStore } from '@/features/auth'
import { useHydrationStore } from '@/features/auth/model/store'
import { useEffect } from 'react'

export function useInitUser() {
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const user = useUserStore(s => s.user)
	const setUser = useUserStore(s => s.setUser)
	const logout = useAuthStore(s => s.logout)

	useEffect(() => {
		if (!hasHydrated) return
		if (!isAuthenticated) return
		if (user) return

		userApi
			.getMe()
			.then(setUser)
			.catch(err => {
				const status = err?.response?.status
				if (status === 401) logout()
			})
	}, [hasHydrated, isAuthenticated])
}
