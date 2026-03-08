import { useUserStore } from '@/entities/user/model/store'
import { useCallback, useEffect, useRef } from 'react'
import { homeworkApi } from '../api'
import { PAGE_SIZE, PREVIEW_SIZE, useHomeworkStore } from '../model/store'

const AUTO_REFRESH_MS = 90 * 60 * 1000
const CACHE_TTL_MS = 15 * 60 * 1000

export function useHomework() {
	const groupId = useUserStore(s => s.user?.group?.id)

	const {
		items,
		expandedStatuses,
		counters,
		status,
		error,
		filterStatus,
		loadedAt,
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

	const loadingRef = useRef(false)
	const loadingMoreRef = useRef<Set<number>>(new Set())

	const loadAll = useCallback(
		async (force = false) => {
			if (!groupId) return
			if (loadingRef.current) return

			const { loadedAt } = useHomeworkStore.getState()
			if (!force && loadedAt && Date.now() - loadedAt < CACHE_TTL_MS) return

			loadingRef.current = true
			setStatus('loading')
			setError(null)

			try {
				const { counters, items } = await homeworkApi.getAll(groupId)
				setCounters(counters)

				const specsMap = new Map<number, string>()
				Object.values(items)
					.flat()
					.forEach(hw => {
						if (hw.spec_id != null && hw.spec_name) {
							specsMap.set(hw.spec_id, hw.spec_name)
						}
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
			} catch {
				setError('Не удалось загрузить домашние задания')
				setStatus('error')
			} finally {
				loadingRef.current = false
			}
		},
		[groupId],
	)

	const loadMore = useCallback(
		async (statusKey: number) => {
			if (!groupId) return
			if (loadingMoreRef.current.has(statusKey)) return
			loadingMoreRef.current.add(statusKey)

			try {
				const currentPage = useHomeworkStore.getState().pages[statusKey] ?? 1
				const nextPage = currentPage + 1
				const newItems = await homeworkApi.getByStatus(
					statusKey,
					groupId,
					nextPage,
				)
				appendItems(statusKey, newItems, nextPage)
				if (newItems.length < PAGE_SIZE) {
					setExpanded(statusKey, true)
				}
			} catch {
			} finally {
				loadingMoreRef.current.delete(statusKey)
			}
		},
		[groupId, appendItems, setExpanded],
	)

	const refresh = useCallback(() => loadAll(true), [loadAll])

	useEffect(() => {
		if (!groupId) return
		loadAll()
	}, [groupId, loadAll])

	useEffect(() => {
		if (!groupId) return
		if (loadedAt === null) loadAll(true)
	}, [loadedAt, groupId, loadAll])

	useEffect(() => {
		if (!groupId) return
		const timer = setInterval(() => loadAll(true), AUTO_REFRESH_MS)
		return () => clearInterval(timer)
	}, [groupId, loadAll])

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
