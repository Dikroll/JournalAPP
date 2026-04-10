import { useAppUpdateStore } from '@/features/appUpdate'
import { fetchLatestAppRelease } from '@/shared/lib/appRelease'
import { useCallback, useState } from 'react'

export function useRefreshNotifications() {
	const [isRefreshing, setIsRefreshing] = useState(false)
	const latestRelease = useAppUpdateStore(s => s.latestRelease)
	const setLatestRelease = useAppUpdateStore(s => s.setLatestRelease)

	const refresh = useCallback(async () => {
		if (isRefreshing) return
		setIsRefreshing(true)
		try {
			const fresh = await fetchLatestAppRelease()
			if (fresh.version !== latestRelease?.version) {
				setLatestRelease(fresh)
			}
		} catch {
			// сеть недоступна — оставляем текущие данные
		} finally {
			setIsRefreshing(false)
		}
	}, [isRefreshing, latestRelease?.version, setLatestRelease])

	return { refresh, isRefreshing }
}
