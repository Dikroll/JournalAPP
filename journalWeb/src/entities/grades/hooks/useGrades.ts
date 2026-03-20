import { ttl } from '@/shared/config'
import { CACHE_KEYS } from '@/shared/lib'
import { storage } from '@/shared/lib/storage'
import { useEffect } from 'react'
import { gradesApi } from '../api'
import { useGradesStore } from '../model/store'
import type { GradeEntry } from '../model/types'

let fetching = false
export function resetGradesFetch() {
	fetching = false
}

export function useGrades() {
	const { entries, status, error, loadedAt, update } = useGradesStore()

	useEffect(() => {
		if (fetching) return
		if (
			entries.length > 0 &&
			loadedAt &&
			Date.now() - loadedAt < ttl.ACTIVITY * 1000
		)
			return

		const cached = storage.get<GradeEntry[]>(CACHE_KEYS.GRADES_ALL)
		if (cached) {
			update({
				entries: cached,
				status: 'success',
				loadedAt: Date.now(),
				error: null,
			})
			return
		}

		fetching = true
		update({ status: 'loading', error: null })
		gradesApi
			.getAll()
			.then(data => {
				update({
					entries: data,
					status: 'success',
					loadedAt: Date.now(),
					error: null,
				})
				storage.set(CACHE_KEYS.GRADES_ALL, data, ttl.ACTIVITY)
			})
			.catch(() => {
				update({ status: 'error', error: 'Не удалось загрузить оценки' })
			})
			.finally(() => {
				fetching = false
			})
	}, [])

	const refresh = () => {
		if (fetching) return
		storage.remove(CACHE_KEYS.GRADES_ALL)
		fetching = true
		update({ status: 'loading', error: null })
		gradesApi
			.getAll()
			.then(data => {
				update({
					entries: data,
					status: 'success',
					loadedAt: Date.now(),
					error: null,
				})
				storage.set(CACHE_KEYS.GRADES_ALL, data, ttl.ACTIVITY)
			})
			.catch(() =>
				update({ status: 'error', error: 'Не удалось загрузить оценки' }),
			)
			.finally(() => {
				fetching = false
			})
	}

	return { entries, status, error, refresh }
}
