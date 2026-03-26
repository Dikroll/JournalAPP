import { RefreshButton } from '@/shared/ui'
import { useRefreshGrades } from '../hooks/useRefreshGrades'

export function RefreshGradesButton() {
	const { refresh, isRefreshing } = useRefreshGrades()
	return <RefreshButton isRefreshing={isRefreshing} onRefresh={refresh} />
}
