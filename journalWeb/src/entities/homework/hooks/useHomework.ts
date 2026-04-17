import { useUserStore } from '@/entities/user'
import { timing, ttl } from '@/shared/config'
import { isCacheValid, preloadImages } from '@/shared/lib'
import { getIsOnline } from '@/shared/model/networkStore'
import { useCallback, useEffect, useRef } from 'react'
import { homeworkApi } from '../api'
import { PAGE_SIZE, PREVIEW_SIZE, useHomeworkStore } from '../model/store'

const CACHE_TTL_MS = ttl.ACTIVITY * 1000

export function resetHomeworkFetch() {}

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

	const loadedAt = useHomeworkStore(s => s.loadedAt)

	const isLoadingAllRef = useRef(false)
	const isLoadingMoreRef = useRef(new Set<number>())

	useEffect(() => {
		groupIdRef.current = groupId
	}, [groupId])

	const loadAll = useCallback(async (force = false) => {
		const gid = groupIdRef.current
		if (!gid) return
		if (isLoadingAllRef.current) return

		const { loadedAt, status: currentStatus } = useHomeworkStore.getState()
		if (!force && isCacheValid(loadedAt, CACHE_TTL_MS)) {
			if (currentStatus === 'idle') setStatus('success')
			return
		}

		if (!getIsOnline()) {
			if (loadedAt !== null) {
				if (currentStatus === 'idle') setStatus('success')
				return
			}
			setError('Нет подключения к интернету')
			setStatus('error')
			return
		}

		isLoadingAllRef.current = true
		setStatus('loading')
		setError(null)

		try {
			const { counters, items } = await homeworkApi.getAll(gid)
			setCounters(counters)

			const specsMap = new Map<number, string>()
			const photoUrls: (string | null)[] = []

			Object.values(items)
				.flat()
				.forEach(hw => {
					if (hw.spec_id != null && hw.spec_name) {
						specsMap.set(hw.spec_id, hw.spec_name)
					}
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

			if (photoUrls.length > 0) preloadImages(photoUrls)
		} catch {
			setError('Не удалось загрузить домашние задания')
			const { loadedAt: currentLoadedAt } = useHomeworkStore.getState()
			if (currentLoadedAt === null) setStatus('error')
		} finally {
			isLoadingAllRef.current = false
		}
	}, [])

	const loadMore = useCallback(
		async (statusKey: number) => {
			const gid = groupIdRef.current
			if (!gid) return
			if (isLoadingMoreRef.current.has(statusKey)) return
			isLoadingMoreRef.current.add(statusKey)

			try {
				const currentPage = useHomeworkStore.getState().pages[statusKey] ?? 1
				const nextPage = currentPage + 1
				const newItems = await homeworkApi.getByStatus(statusKey, gid, nextPage)
				appendItems(statusKey, newItems, nextPage)

				const newPhotos = newItems
					.map(hw => hw.photo_url)
					.filter(Boolean) as string[]
				if (newPhotos.length > 0) preloadImages(newPhotos)

				if (newItems.length < PAGE_SIZE) {
					setExpanded(statusKey, true)
				}
			} catch {
			} finally {
				isLoadingMoreRef.current.delete(statusKey)
			}
		},
		[appendItems, setExpanded],
	)

	const refresh = useCallback(() => loadAll(true), [loadAll])

	useEffect(() => {
		if (!groupId) return
		loadAll()
		const timer = setInterval(() => loadAll(true), timing.HOMEWORK_AUTO_REFRESH)
		return () => clearInterval(timer)
	}, [groupId, loadAll])

	// Re-fetch immediately when cache is invalidated externally (e.g. queue processor)
	useEffect(() => {
		if (loadedAt === null && groupId) {
			loadAll(true)
		}
	}, [loadedAt, groupId, loadAll])

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
