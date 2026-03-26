import { useUserStore } from '@/entities/user'
import { useAuthStore } from '@/features/auth/model/store'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSwitchUser } from './useSwitchUser'

export function useAccountSwitcher(onReset: () => void, onClose: () => void) {
	const accounts = useAuthStore(s => s.accounts)
	const activeUsername = useAuthStore(s => s.activeUsername)
	const removeAccount = useAuthStore(s => s.removeAccount)
	const logout = useAuthStore(s => s.logout)
	const clearUser = useUserStore(s => s.clearUser)
	const navigate = useNavigate()

	const { switchTo, switching } = useSwitchUser(onReset)
	const [switchingTo, setSwitchingTo] = useState<string | null>(null)
	const [confirmLogout, setConfirmLogout] = useState(false)

	const handleSwitch = useCallback(
		async (username: string) => {
			if (switching) return
			setSwitchingTo(username)
			await switchTo(username)
			setSwitchingTo(null)
			onClose()
		},
		[switching, switchTo, onClose],
	)

	const handleRemove = useCallback(
		(username: string) => {
			const isActive = username === activeUsername
			if (!isActive) {
				removeAccount(username)
				return
			}
			const remaining = useAuthStore
				.getState()
				.accounts.filter(a => a.username !== username)
			removeAccount(username)
			onReset()
			clearUser()
			logout()
			onClose()

			if (remaining.length === 0) {
				navigate('/login', { replace: true })
			} else {
				navigate('/', { replace: true })
			}
		},
		[
			activeUsername,
			removeAccount,
			onReset,
			clearUser,
			logout,
			onClose,
			navigate,
		],
	)

	const handleLogout = useCallback(() => {
		const remaining = useAuthStore
			.getState()
			.accounts.filter(a => a.username !== activeUsername)
		onReset()
		clearUser()
		logout()
		onClose()
		if (remaining.length === 0) {
			navigate('/login', { replace: true })
		} else {
			navigate('/', { replace: true })
		}
	}, [activeUsername, onReset, clearUser, logout, onClose, navigate])

	return {
		accounts,
		activeUsername,
		switching,
		switchingTo,
		confirmLogout,
		setConfirmLogout,
		handleSwitch,
		handleRemove,
		handleLogout,
	}
}
