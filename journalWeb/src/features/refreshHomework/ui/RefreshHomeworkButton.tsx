import { RefreshButton } from '@/shared/ui'
import { useRefreshHomework } from '../hooks/useRefreshHomework'
import { useEffect, useState } from 'react'

interface Props {
	className?: string
}

export function RefreshHomeworkButton({ className }: Props) {
	const { refresh, isRefreshing } = useRefreshHomework()
	const [isRefreshingLocal, setIsRefreshingLocal] = useState(false)

	const handleRefresh = () => {
		setIsRefreshingLocal(true)
		refresh()
	}

	useEffect(() => {
		if (!isRefreshing) {
			setIsRefreshingLocal(false)
		}
	}, [isRefreshing])

	return <RefreshButton isRefreshing={isRefreshing || isRefreshingLocal} onRefresh={handleRefresh} className={className} />
}
