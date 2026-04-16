import { useAppUpdateStore } from '@/features/appUpdate'
import { fetchLatestAppRelease } from '@/shared/lib/appRelease'
import { useNetworkStore } from '@/shared/model/networkStore'
import { useCallback, useState } from 'react'

export function useRefreshNotifications() {
	const isOnline = useNetworkStore(s => s.isOnline)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const latestRelease = useAppUpdateStore(s => s.latestRelease)
	const setLatestRelease = useAppUpdateStore(s => s.setLatestRelease)

	const refresh = useCallback(async () => {
		if (!isOnline) return
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
	}, [isOnline, isRefreshing, latestRelease?.version, setLatestRelease])

	return { refresh, isRefreshing, isOnline }
}
