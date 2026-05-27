import { useAppUpdate } from '@/features/appUpdate'
import { feedbackApi, useFeedbackStore } from '@/entities/feedback'
import { useNetworkRefresh } from '@/shared/hooks/useNetworkRefresh'
import { newsApi, useNewsStore } from '@/entities/news'
import { CACHE_KEYS } from '@/shared/lib'
import { storage } from '@/shared/lib/encryptedStorage'
import { ttl } from '@/shared/config'
import { useCallback, useState } from 'react'

export function useRefreshNotifications() {
	const [isRefreshing, setIsRefreshing] = useState(false)
	const { checkForUpdate } = useAppUpdate()
	const setPending = useFeedbackStore(s => s.setPending)
	const setPendingLoadedAt = useFeedbackStore(s => s.setPendingLoadedAt)
	const setPendingStatus = useFeedbackStore(s => s.setPendingStatus)
	const updateNews = useNewsStore(s => s.update)

	const refreshAction = useCallback(async () => {
		if (isRefreshing) return;
		setIsRefreshing(true);

		const updateTask = checkForUpdate().catch(() => {});

		const pendingTask = feedbackApi
			.getPending()
			.then((data) => {
				setPending(data);
				setPendingLoadedAt(Date.now());
				setPendingStatus("success");
			})
			.catch(() => {});

		const newsTask = newsApi
			.getLatest()
			.then(data => {
				updateNews({
					latest: data,
					status: 'success',
					loadedAt: Date.now(),
					error: null,
				})
				storage.set(CACHE_KEYS.NEWS, data, ttl.ACTIVITY)
			})
			.catch(() => {})

		try {
			await Promise.all([updateTask, pendingTask, newsTask])
		} finally {
			setIsRefreshing(false);
		}
	}, [
		isRefreshing,
		checkForUpdate,
		setPending,
		setPendingLoadedAt,
		setPendingStatus,
		updateNews,
	])

	return useNetworkRefresh(refreshAction, isRefreshing);
}
