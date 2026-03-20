import { useUserStore } from '@/entities/user'
import { isCacheValid, preloadImages } from '@/shared/lib'
import { useCallback, useEffect, useRef } from 'react'
import { homeworkApi } from '../api'
import { PAGE_SIZE, PREVIEW_SIZE, useHomeworkStore } from '../model/store'

const AUTO_REFRESH_MS = 90 * 60 * 1000
const CACHE_TTL_MS = 15 * 60 * 1000

let isLoadingAll = false
const isLoadingMore = new Set<number>()

export function useHomework() {
	const groupId = useUserStore(s => s.user?.group?.id)

	const {
		items,
		expandedStatuses,
		counters,
		status,
		error,
		filterStatus,
		setItems,
		appendItems,
		setExpanded,
		setCounters,
		setStatus,
		setError,
		setFilter,
		setLoadedAt,
		setKnownSpecs,
	} = useHomeworkStore()

	const groupIdRef = useRef(groupId)

	useEffect(() => {
		groupIdRef.current = groupId
	}, [groupId])

	const loadAll = useCallback(async (force = false) => {
		const groupId = groupIdRef.current
		if (!groupId) return
		if (isLoadingAll) return

		const { loadedAt } = useHomeworkStore.getState()
		if (!force && isCacheValid(loadedAt, CACHE_TTL_MS)) return

		isLoadingAll = true
		setStatus('loading')
		setError(null)

		try {
			const { counters, items } = await homeworkApi.getAll(groupId)
			setCounters(counters)

			const specsMap = new Map<number, string>()
			const photoUrls: (string | null)[] = []

			Object.values(items)
				.flat()
				.forEach(hw => {
					if (hw.spec_id != null && hw.spec_name) {
						specsMap.set(hw.spec_id, hw.spec_name)
					}
					// collect all photo_url for preloading
					if (hw.photo_url) photoUrls.push(hw.photo_url)
				})

			setKnownSpecs(
				Array.from(specsMap.entries())
					.map(([specId, specName]) => ({ specId, specName }))
					.sort((a, b) => a.specName.localeCompare(b.specName, 'ru')),
			)

			Object.entries(items).forEach(([statusKey, list]) => {
				setItems(Number(statusKey), list)
			})

			setLoadedAt(Date.now())
			setStatus('success')

			// preload all cover images so switching to photo mode uses browser cache
			if (photoUrls.length > 0) preloadImages(photoUrls)
		} catch {
			setError('Не удалось загрузить домашние задания')
			setStatus('error')
		} finally {
			isLoadingAll = false
		}
	}, [])

	const loadMore = useCallback(
		async (statusKey: number) => {
			const groupId = groupIdRef.current
			if (!groupId) return
			if (isLoadingMore.has(statusKey)) return
			isLoadingMore.add(statusKey)

			try {
				const currentPage = useHomeworkStore.getState().pages[statusKey] ?? 1
				const nextPage = currentPage + 1
				const newItems = await homeworkApi.getByStatus(
					statusKey,
					groupId,
					nextPage,
				)
				appendItems(statusKey, newItems, nextPage)
				// preload photos from newly loaded page
				const newPhotos = newItems
					.map(hw => hw.photo_url)
					.filter(Boolean) as string[]
				if (newPhotos.length > 0) preloadImages(newPhotos)

				if (newItems.length < PAGE_SIZE) {
					setExpanded(statusKey, true)
				}
			} catch {
			} finally {
				isLoadingMore.delete(statusKey)
			}
		},
		[appendItems, setExpanded],
	)

	const refresh = useCallback(() => loadAll(true), [loadAll])

	useEffect(() => {
		if (!groupId) return
		loadAll()
		const timer = setInterval(() => loadAll(true), AUTO_REFRESH_MS)
		return () => clearInterval(timer)
	}, [groupId])

	return {
		items,
		expandedStatuses,
		counters,
		status,
		error,
		filterStatus,
		loadMore,
		refresh,
		setFilter,
		PREVIEW_SIZE,
	}
}
