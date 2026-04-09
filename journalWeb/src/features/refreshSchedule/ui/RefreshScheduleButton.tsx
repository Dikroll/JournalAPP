import { RefreshButton } from '@/shared/ui'
import { useRefreshSchedule } from '../hooks/useRefreshSchedule'

export function RefreshScheduleButton() {
	const { refresh, isRefreshing } = useRefreshSchedule()
	return <RefreshButton isRefreshing={isRefreshing} onRefresh={refresh} />
}
