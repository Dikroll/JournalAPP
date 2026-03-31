import { useLibrary, useLibraryStore } from '@/entities/library'
import { useCallback } from 'react'

export function useRefreshLibrary() {
	const { selectedSpecId, selectedMaterialType, status } = useLibraryStore()
	const { load } = useLibrary({
		specId: selectedSpecId ?? undefined,
		materialType: selectedMaterialType ?? undefined,
		autoLoad: false,
	})

	const refresh = useCallback(() => {
		load(true) // force refresh
	}, [load])

	return {
		refresh,
		isRefreshing: status === 'loading',
	}
}
