import { useUserStore } from '@/entities/user'
import { pageConfig } from '@/shared/config'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resetAllAppState } from '@/shared/lib'

export function useLogout() {
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const clearUser = useUserStore(s => s.clearUser)

	const logout = useCallback(async () => {
		setLoading(true)
		try {
			// Clear user entity first
			clearUser()

			// Reset all app state (including auth)
			resetAllAppState({
				resetAuth: true,
				resetTheme: true,
				resetOnboarding: true,
			})

			// Navigate to login
			navigate(pageConfig.login, { replace: true })
		} finally {
			setLoading(false)
		}
	}, [clearUser, navigate])

	return {
		logout,
		loading,
	}
}
