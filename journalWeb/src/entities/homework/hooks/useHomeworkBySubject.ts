import { useUserStore } from '@/entities/user'
import { isCacheValid, preloadImages } from '@/shared/lib'
import { useCallback, useRef } from 'react'
import { homeworkApi } from '../api'
import { PAGE_SIZE, useHomeworkStore } from '../model/store'
import type { HomeworkItem } from '../model/types'

const CACHE_TTL_MS = 15 * 60 * 1000

export function useHomeworkBySubject() {
	const groupId = useUserStore(s => s.user?.group?.id)
	const {
		subjects,
		knownSpecs,
		setSubjectData,
		appendSubjectItems,
		setSubjectExpanded,
		setSubjectStatus,
	} = useHomeworkStore()

	const loadingRef = useRef<Set<number>>(new Set())
	const loadingMoreRef = useRef<Map<string, boolean>>(new Map())

	const loadSubject = useCallback(
		async (specId: number, specName: string, force = false) => {
			if (!groupId) return
			if (loadingRef.current.has(specId)) return

			const existing = useHomeworkStore.getState().subjects[specId]
			if (!force && isCacheValid(existing?.loadedAt ?? null, CACHE_TTL_MS))
				return

			loadingRef.current.add(specId)
			setSubjectStatus(specId, 'loading')

			try {
				const { counters, items } = await homeworkApi.getBySubject(
					groupId,
					specId,
				)

				const parsedItems: Record<number, HomeworkItem[]> = {}
				const photoUrls: string[] = []

				for (const [key, list] of Object.entries(items)) {
					parsedItems[Number(key)] = list
					list.forEach(hw => {
						if (hw.photo_url) photoUrls.push(hw.photo_url)
					})
				}

				setSubjectData(specId, specName, counters, parsedItems)

				if (photoUrls.length > 0) preloadImages(photoUrls)
			} catch {
				setSubjectStatus(specId, 'error')
			} finally {
				loadingRef.current.delete(specId)
			}
		},
		[groupId],
	)

	const loadMoreForSubject = useCallback(
		async (specId: number, statusKey: number) => {
			if (!groupId) return
			const mapKey = `${specId}-${statusKey}`
			if (loadingMoreRef.current.get(mapKey)) return
			loadingMoreRef.current.set(mapKey, true)

			try {
				const currentPage =
					useHomeworkStore.getState().subjects[specId]?.pages[statusKey] ?? 1
				const nextPage = currentPage + 1

				const newItems = await homeworkApi.getByStatusAndSubject(
					statusKey,
					groupId,
					specId,
					nextPage,
				)
				appendSubjectItems(specId, statusKey, newItems, nextPage)

				const newPhotos = newItems
					.map(hw => hw.photo_url)
					.filter(Boolean) as string[]
				if (newPhotos.length > 0) preloadImages(newPhotos)

				if (newItems.length < PAGE_SIZE) {
					setSubjectExpanded(specId, statusKey, true)
				}
			} catch {
			} finally {
				loadingMoreRef.current.delete(mapKey)
			}
		},
		[groupId],
	)

	return { subjects, knownSpecs, loadSubject, loadMoreForSubject }
}
