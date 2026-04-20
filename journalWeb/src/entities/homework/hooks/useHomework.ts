import { useUserStore } from '@/entities/user'
import { timing, ttl } from '@/shared/config'
import { isCacheValid, preloadImages } from '@/shared/lib'
import { getIsOnline } from '@/shared/model/networkStore'
import { useCallback, useEffect } from 'react'
import { homeworkApi } from '../api'
import { PAGE_SIZE, PREVIEW_SIZE, useHomeworkStore } from '../model/store'

const CACHE_TTL_MS = ttl.ACTIVITY * 1000

const loadingAllByGroup = new Map<number, Promise<void>>()
const loadingMoreByKey = new Map<string, Promise<void>>()

async function runLoadAll(groupId: number, force: boolean) {
	if (loadingAllByGroup.has(groupId)) {
		await loadingAllByGroup.get(groupId)
		return
	}

	const store = useHomeworkStore.getState()
	const { loadedAt, status: currentStatus } = store

	if (!force && isCacheValid(loadedAt, CACHE_TTL_MS)) {
		if (currentStatus === 'idle') store.setStatus('success')
		return
	}

	if (!getIsOnline()) {
		if (loadedAt !== null) {
			if (currentStatus === 'idle') store.setStatus('success')
			return
		}
		store.setError('Нет подключения к интернету')
		store.setStatus('error')
		return
	}

	store.setStatus('loading')
	store.setError(null)

	const promise = (async () => {
		try {
			const { counters, items } = await homeworkApi.getAll(groupId)
			const latest = useHomeworkStore.getState()
			latest.setCounters(counters)

			const specsMap = new Map<number, string>()
			const photoUrls: string[] = []

			Object.values(items)
				.flat()
				.forEach(hw => {
					if (hw.spec_id != null && hw.spec_name) {
						specsMap.set(hw.spec_id, hw.spec_name)
					}
					if (hw.photo_url) photoUrls.push(hw.photo_url)
				})

			latest.setKnownSpecs(
				Array.from(specsMap.entries())
					.map(([specId, specName]) => ({ specId, specName }))
					.sort((a, b) => a.specName.localeCompare(b.specName, 'ru')),
			)

			Object.entries(items).forEach(([statusKey, list]) => {
				latest.setItems(Number(statusKey), list)
			})

			latest.setLoadedAt(Date.now())
			latest.setStatus('success')

			if (photoUrls.length > 0) preloadImages(photoUrls)
		} catch {
			const latest = useHomeworkStore.getState()
			latest.setError('Не удалось загрузить домашние задания')
			if (latest.loadedAt === null) latest.setStatus('error')
		} finally {
			loadingAllByGroup.delete(groupId)
		}
	})()

	loadingAllByGroup.set(groupId, promise)
	await promise
}

async function runLoadMore(groupId: number, statusKey: number) {
	const mapKey = `${groupId}-${statusKey}`
	if (loadingMoreByKey.has(mapKey)) return loadingMoreByKey.get(mapKey)

	const promise = (async () => {
		try {
			const store = useHomeworkStore.getState()
			const currentPage = store.pages[statusKey] ?? 1
			const nextPage = currentPage + 1
			const newItems = await homeworkApi.getByStatus(statusKey, groupId, nextPage)
			store.appendItems(statusKey, newItems, nextPage)

			const newPhotos = newItems
				.map(hw => hw.photo_url)
				.filter((u): u is string => !!u)
			if (newPhotos.length > 0) preloadImages(newPhotos)

			if (newItems.length < PAGE_SIZE) {
				store.setExpanded(statusKey, true)
			}
		} catch {
		} finally {
			loadingMoreByKey.delete(mapKey)
		}
	})()

	loadingMoreByKey.set(mapKey, promise)
	return promise
}

export function useHomework() {
	const groupId = useUserStore(s => s.user?.group?.id)

	const items = useHomeworkStore(s => s.items)
	const expandedStatuses = useHomeworkStore(s => s.expandedStatuses)
	const counters = useHomeworkStore(s => s.counters)
	const status = useHomeworkStore(s => s.status)
	const error = useHomeworkStore(s => s.error)
	const filterStatus = useHomeworkStore(s => s.filterStatus)
	const loadedAt = useHomeworkStore(s => s.loadedAt)
	const setFilter = useHomeworkStore(s => s.setFilter)

	const loadAll = useCallback((force = false) => {
		if (!groupId) return Promise.resolve()
		return runLoadAll(groupId, force)
	}, [groupId])

	const loadMore = useCallback(
		(statusKey: number) => {
			if (!groupId) return Promise.resolve()
			return runLoadMore(groupId, statusKey)
		},
		[groupId],
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
