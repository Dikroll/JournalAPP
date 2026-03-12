import { useEffect } from 'react'
import { userApi } from '../api'
import { useUserStore } from '../model/store'

export function useUser() {
	const { user, setUser } = useUserStore()

	useEffect(() => {
		if (user) return

		let cancelled = false

		userApi
			.getMe()
			.then(data => {
				if (!cancelled) setUser(data)
			})
			.catch(err => {
				const status = err?.response?.status
				if (status && status !== 401) {
					console.warn('[useUser] failed to fetch user:', status)
				}
			})

		return () => {
			cancelled = true
		}
	}, [])

	return user
}
