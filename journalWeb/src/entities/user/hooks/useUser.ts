import { useEffect } from 'react'
import { userApi } from '../api'
import { useUserStore } from '../model/store'

export function useUser() {
	const { user, setUser } = useUserStore()

	useEffect(() => {
		if (user) return
		userApi
			.getMe()
			.then(setUser)
			.catch(() => {})
	}, [])

	return user
}
