import { useLibrary, useLibraryStore } from '@/entities/library'
import { useCallback } from 'react'

export function useRefreshLibrary() {
	const { status } = useLibraryStore()
	const { load } = useLibrary({
		autoLoad: false,
	})

	const refresh = useCallback(() => {
		load(true)
	}, [load])

	return {
		refresh,
		isRefreshing: status === 'loading',
	}
}
