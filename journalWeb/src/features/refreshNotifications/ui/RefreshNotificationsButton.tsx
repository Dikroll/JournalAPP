import { IconButton } from '@/shared/ui'
import { RefreshCw } from 'lucide-react'
import { useRefreshNotifications } from '../hooks/useRefreshNotifications'

export function RefreshNotificationsButton() {
	const { refresh, isRefreshing } = useRefreshNotifications()

	return (
		<IconButton
			icon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
			onClick={refresh}
			disabled={isRefreshing}
			size='md'
			shape='square'
			variant='surface'
			style={{ boxShadow: 'var(--shadow-card)' }}
			aria-label='Обновить'
		/>
	)
}
