import { useHomework } from '@/entities/homework'
import { useNetworkStore } from '@/shared/model/networkStore'
import { useCallback } from 'react'

export function useRefreshHomework() {
	const isOnline = useNetworkStore(s => s.isOnline)
	const { refresh: doRefresh, status } = useHomework()

	const refresh = useCallback(() => {
		if (!isOnline) return
		doRefresh()
	}, [isOnline, doRefresh])

	return {
		refresh,
		isRefreshing: status === 'loading',
		isOnline,
	}
}
