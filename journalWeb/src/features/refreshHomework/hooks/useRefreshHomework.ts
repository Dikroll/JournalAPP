import { useHomeworkStore } from '@/entities/homework'
import { useCallback } from 'react'

export function useRefreshHomework() {
	const invalidate = useHomeworkStore(s => s.invalidate)
	const status = useHomeworkStore(s => s.status)

	const refresh = useCallback(() => {
		invalidate()
	}, [invalidate])

	const isRefreshing = status === 'loading'

	return { refresh, isRefreshing }
}
