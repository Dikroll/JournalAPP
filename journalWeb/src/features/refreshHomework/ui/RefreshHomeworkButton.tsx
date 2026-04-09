import { RefreshButton } from '@/shared/ui'
import { useRefreshHomework } from '../hooks/useRefreshHomework'

interface Props {
	className?: string
}

export function RefreshHomeworkButton({ className }: Props) {
	const { refresh, isRefreshing } = useRefreshHomework()

	return <RefreshButton isRefreshing={isRefreshing} onRefresh={refresh} className={className} />
}
