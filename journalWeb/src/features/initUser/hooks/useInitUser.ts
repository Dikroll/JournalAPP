import { userApi, useUserStore } from '@/entities/user'
import { useAuthStore } from '@/features/auth'
import { useHydrationStore } from '@/features/auth/model/store'
import { useEffect } from 'react'

let fetching = false
export function resetInitUserFetch() {
	fetching = false
}

export function useInitUser() {
	const hasHydrated = useHydrationStore(s => s.hasHydrated)
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const activeUsername = useAuthStore(s => s.activeUsername)
	const user = useUserStore(s => s.user)
	const setUser = useUserStore(s => s.setUser)

	useEffect(() => {
		if (!hasHydrated) return
		if (!isAuthenticated) return
		if (user) return
		if (fetching) return

		fetching = true

		userApi
			.getMe()
			.then(data => setUser(data))
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
