import { userApi, useUserStore } from '@/entities/user'
import { useAuthStore } from '@/features/auth'
import { fixUrl } from '@/shared/lib/imageCache'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function useSwitchUser(onReset: () => void) {
	const [switching, setSwitching] = useState(false)
	const switchAccount = useAuthStore(s => s.switchAccount)
	const saveAccount = useAuthStore(s => s.saveAccount)
	const setUser = useUserStore(s => s.setUser)
	const navigate = useNavigate()

	const switchTo = useCallback(
		async (username: string) => {
			setSwitching(true)
			try {
				onReset()

				const success = switchAccount(username)
				if (!success) return

				try {
					const userData = await userApi.getMe()
					setUser(userData)
					saveAccount({
						username,
						token: useAuthStore.getState().token!,
						fullName: userData.full_name,
						groupName: userData.group.name,
						avatarUrl: fixUrl(userData.photo_url),
					})
				} catch {}

				navigate('/', { replace: true })
			} finally {
				setSwitching(false)
			}
		},
		[onReset, switchAccount, saveAccount, setUser, navigate],
	)

	return { switchTo, switching }
}
