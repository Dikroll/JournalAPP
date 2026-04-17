import { RefreshButton } from '@/shared/ui'
import { useRefreshNotifications } from '../hooks/useRefreshNotifications'

export function RefreshNotificationsButton() {
	const { refresh, isRefreshing } = useRefreshNotifications()
	return <RefreshButton isRefreshing={isRefreshing} onRefresh={refresh} />
}
