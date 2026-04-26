import { RefreshButton } from '@/shared/ui'
import { useRefreshLibrary } from '../hooks/useRefreshLibrary'

export function RefreshLibraryButton() {
	const { refresh, isRefreshing } = useRefreshLibrary()
	return <RefreshButton isRefreshing={isRefreshing} onRefresh={refresh} />
}
