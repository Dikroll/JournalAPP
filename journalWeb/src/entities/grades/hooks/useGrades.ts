import { ttl } from '@/shared/config'
import { isCacheValid, storage } from '@/shared/lib'
import { useEffect } from 'react'
import { gradesApi } from '../api'
import { useGradesStore } from '../model/store'
import type { GradeEntry } from '../model/types'

const CACHE_KEY = 'cache:grades:all'
const CACHE_TTL_MS = ttl.ACTIVITY * 1000

let fetching = false

async function fetchAndStore(
	update: ReturnType<typeof useGradesStore.getState>['update'],
) {
	if (fetching) return
	fetching = true
	update({ status: 'loading', error: null })

	try {
		const data = await gradesApi.getAll()
		update({
			entries: data,
			status: 'success',
			loadedAt: Date.now(),
			error: null,
		})
		storage.set(CACHE_KEY, data, ttl.ACTIVITY)
	} catch {
		update({ status: 'error', error: 'Не удалось загрузить оценки' })
	} finally {
		fetching = false
	}
}

export function useGrades() {
	const { entries, status, error, loadedAt, update } = useGradesStore()

	useEffect(() => {
		if (fetching) return
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return

		const cached = storage.get<GradeEntry[]>(CACHE_KEY)
		if (cached) {
			update({
				entries: cached,
				status: 'success',
				loadedAt: Date.now(),
				error: null,
			})
			return
		}

		fetchAndStore(update)
	}, [])

	const refresh = () => {
		storage.remove(CACHE_KEY)
		fetchAndStore(update)
	}

	return { entries, status, error, refresh }
}
