import { ttl } from '@/shared/config'
import { useEntityFetch } from '@/shared/hooks/useEntityFetch'
import { reviewsApi } from '../api'
import { useReviewStore } from '../model/store'
import type { ReviewItem } from '../model/types'

const CACHE_TTL_MS = ttl.REVIEWS * 1000

function sortByDateDesc(items: ReviewItem[]): ReviewItem[] {
	return [...items].sort((a, b) => b.date.localeCompare(a.date))
}

export function useReviews() {
	const { reviews, status, loadedAt, setReviews, setStatus, setLoadedAt } =
		useReviewStore()

	useEntityFetch({
		loadedAt,
		ttlMs: CACHE_TTL_MS,
		status,
		fetchFn: () => reviewsApi.getList(),
		onStart: () => setStatus('loading'),
		onSuccess: data => {
			const sorted = sortByDateDesc(data)
			setReviews(sorted)
			setLoadedAt(Date.now())
			setStatus('success')
		},
		onError: () => setStatus('error'),
	})

	return { reviews, status }
}
