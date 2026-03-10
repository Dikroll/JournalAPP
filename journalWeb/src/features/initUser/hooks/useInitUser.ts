import { userApi, useUserStore } from '@/entities/user'
import { useAuthStore } from '@/features/auth'
import { useEffect } from 'react'

export function useInitUser() {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const user = useUserStore(s => s.user)
	const setUser = useUserStore(s => s.setUser)
	const logout = useAuthStore(s => s.logout)

	useEffect(() => {
		if (!isAuthenticated) return
		if (user) return

		userApi
			.getMe()
			.then(setUser)
			.catch(() => logout())
	}, [isAuthenticated])
}
