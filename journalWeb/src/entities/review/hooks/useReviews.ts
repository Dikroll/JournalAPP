import { ttl } from '@/shared/config'
import { CACHE_KEYS, isCacheValid, storage } from '@/shared/lib'
import { useEffect } from 'react'
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

	useEffect(() => {
		if (status === 'loading') return
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return

		const cached = storage.get<ReviewItem[]>(CACHE_KEYS.REVIEWS)
		if (cached) {
			setReviews(sortByDateDesc(cached))
			setLoadedAt(Date.now())
			setStatus('success')
			return
		}

		setStatus('loading')
		reviewsApi
			.getList()
			.then(data => {
				const sorted = sortByDateDesc(data)
				setReviews(sorted)
				setLoadedAt(Date.now())
				setStatus('success')
				storage.set(CACHE_KEYS.REVIEWS, sorted, ttl.REVIEWS)
			})
			.catch(() => setStatus('error'))
	}, [])

	return { reviews, status }
}
