import { useUserStore } from '@/entities/user'
import { resetAllAppState } from '@/app/lib'
import { pageConfig } from '@/shared/config'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function useLogout() {
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()
	const clearUser = useUserStore(s => s.clearUser)

	const logout = useCallback(async () => {
		setLoading(true)
		try {
			clearUser()
			resetAllAppState({
				resetAuth: true,
				resetTheme: true,
				resetOnboarding: true,
			})

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
