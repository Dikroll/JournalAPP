import { userApi, useUserStore } from '@/entities/user'
import { useAuthStore } from '@/features/auth'
import { fixUrl } from '@/shared/lib/imageCache'
import { resetAllStores } from '@/shared/lib/resetAllStores'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function useSwitchUser() {
	const [switching, setSwitching] = useState(false)
	const switchAccount = useAuthStore(s => s.switchAccount)
	const saveAccount = useAuthStore(s => s.saveAccount)
	const setUser = useUserStore(s => s.setUser)
	const navigate = useNavigate()

	const switchTo = useCallback(
		async (username: string) => {
			setSwitching(true)
			try {
				// 1. Полный сброс данных предыдущего пользователя
				resetAllStores()

				// 2. Переключаем токен в сторе
				const success = switchAccount(username)
				if (!success) return

				// 3. Грузим данные нового пользователя свежие
				try {
					const userData = await userApi.getMe()
					setUser(userData)

					// Обновляем аватар и имя в списке аккаунтов
					saveAccount({
						username,
						token: useAuthStore.getState().token!,
						fullName: userData.full_name,
						groupName: userData.group.name,
						avatarUrl: fixUrl(userData.photo_url),
					})
				} catch {
					// useInitUser подхватит позже
				}

				navigate('/', { replace: true })
			} finally {
				setSwitching(false)
			}
		},
		[switchAccount, saveAccount, setUser, navigate],
	)

	return { switchTo, switching }
}
