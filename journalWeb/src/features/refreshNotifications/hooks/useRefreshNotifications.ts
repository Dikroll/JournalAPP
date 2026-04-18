import { useAppUpdate } from '@/features/appUpdate'
import { feedbackApi, useFeedbackStore } from '@/entities/feedback'
import { useNetworkStore } from '@/shared/model/networkStore'
import { useCallback, useState } from 'react'

export function useRefreshNotifications() {
	const isOnline = useNetworkStore(s => s.isOnline)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const { checkForUpdate } = useAppUpdate()
	const setPending = useFeedbackStore(s => s.setPending)
	const setPendingLoadedAt = useFeedbackStore(s => s.setPendingLoadedAt)
	const setPendingStatus = useFeedbackStore(s => s.setPendingStatus)

	const refresh = useCallback(async () => {
		if (!isOnline) return
		if (isRefreshing) return
		setIsRefreshing(true)

		const updateTask = checkForUpdate().catch(() => {})

		const pendingTask = feedbackApi
			.getPending()
			.then(data => {
				setPending(data)
				setPendingLoadedAt(Date.now())
				setPendingStatus('success')
			})
			.catch(() => {})

		try {
			await Promise.all([updateTask, pendingTask])
		} finally {
			setIsRefreshing(false)
		}
	}, [
		isOnline,
		isRefreshing,
		checkForUpdate,
		setPending,
		setPendingLoadedAt,
		setPendingStatus,
	])

	return { refresh, isRefreshing, isOnline }
}
