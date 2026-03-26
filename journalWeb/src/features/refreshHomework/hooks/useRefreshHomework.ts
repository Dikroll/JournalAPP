import { useHomework } from '@/entities/homework'

export function useRefreshHomework() {
	const { refresh, status } = useHomework()

	return {
		refresh,
		isRefreshing: status === 'loading',
	}
}
