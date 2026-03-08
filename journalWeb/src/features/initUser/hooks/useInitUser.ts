import { userApi } from '@/entities/user/api'
import { useUserStore } from '@/entities/user/model/store'
import type { UserInfo } from '@/entities/user/model/types'
import { useAuthStore } from '@/features/auth/model/store'
import { ttl } from '@/shared/config/cache'
import { cachedFetch } from '@/shared/lib/cachedFetch'
import { CACHE_KEYS } from '@/shared/lib/storage'
import { useEffect } from 'react'

export function useInitUser() {
	const isAuthenticated = useAuthStore(s => s.isAuthenticated)
	const user = useUserStore(s => s.user)
	const setUser = useUserStore(s => s.setUser)
	const logout = useAuthStore(s => s.logout)

	useEffect(() => {
		if (!isAuthenticated) return
		if (user) return

		cachedFetch<UserInfo>({
			key: CACHE_KEYS.USER_ME,
			fetcher: () => userApi.getMe(),
			ttlSeconds: ttl.USER_INFO,
			onData: data => setUser(data),
			onError: () => logout(),
		})
	}, [isAuthenticated])
}
