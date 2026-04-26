import { useUserStore } from '@/entities/user'
import { ttl } from '@/shared/config'
import { isCacheValid, preloadImages } from '@/shared/lib'
import { useCallback } from 'react'
import { homeworkApi } from '../api'
import { PAGE_SIZE, useHomeworkStore } from '../model/store'
import type { HomeworkItem } from '../model/types'

const CACHE_TTL_MS = ttl.ACTIVITY * 1000

const loadingBySubject = new Map<number, Promise<void>>()
const loadingMoreBySubject = new Map<string, Promise<void>>()

async function runLoadSubject(
	groupId: number,
	specId: number,
	specName: string,
	force: boolean,
) {
	if (loadingBySubject.has(specId)) {
		return loadingBySubject.get(specId)
	}

	const existing = useHomeworkStore.getState().subjects[specId]
	if (!force && isCacheValid(existing?.loadedAt ?? null, CACHE_TTL_MS)) return

	const promise = (async () => {
		const store = useHomeworkStore.getState()
		store.setSubjectStatus(specId, 'loading')

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

			useHomeworkStore
				.getState()
				.setSubjectData(specId, specName, counters, parsedItems)

			if (photoUrls.length > 0) preloadImages(photoUrls)
		} catch {
			useHomeworkStore.getState().setSubjectStatus(specId, 'error')
		} finally {
			loadingBySubject.delete(specId)
		}
	})()

	loadingBySubject.set(specId, promise)
	return promise
}

async function runLoadMoreForSubject(
	groupId: number,
	specId: number,
	statusKey: number,
) {
	const mapKey = `${specId}-${statusKey}`
	if (loadingMoreBySubject.has(mapKey)) return loadingMoreBySubject.get(mapKey)

	const promise = (async () => {
		try {
			const store = useHomeworkStore.getState()
			const currentPage = store.subjects[specId]?.pages[statusKey] ?? 1
			const nextPage = currentPage + 1

			const newItems = await homeworkApi.getByStatusAndSubject(
				statusKey,
				groupId,
				specId,
				nextPage,
			)
			useHomeworkStore
				.getState()
				.appendSubjectItems(specId, statusKey, newItems, nextPage)

			const newPhotos = newItems
				.map(hw => hw.photo_url)
				.filter((u): u is string => !!u)
			if (newPhotos.length > 0) preloadImages(newPhotos)

			if (newItems.length < PAGE_SIZE) {
				useHomeworkStore.getState().setSubjectExpanded(specId, statusKey, true)
			}
		} catch {
		} finally {
			loadingMoreBySubject.delete(mapKey)
		}
	})()

	loadingMoreBySubject.set(mapKey, promise)
	return promise
}

export function useHomeworkBySubject() {
	const groupId = useUserStore(s => s.user?.group?.id)

	const subjects = useHomeworkStore(s => s.subjects)
	const knownSpecs = useHomeworkStore(s => s.knownSpecs)

	const loadSubject = useCallback(
		(specId: number, specName: string, force = false) => {
			if (!groupId) return Promise.resolve()
			return runLoadSubject(groupId, specId, specName, force)
		},
		[groupId],
	)

	const loadMoreForSubject = useCallback(
		(specId: number, statusKey: number) => {
			if (!groupId) return Promise.resolve()
			return runLoadMoreForSubject(groupId, specId, statusKey)
		},
		[groupId],
	)

	return { subjects, knownSpecs, loadSubject, loadMoreForSubject }
}
