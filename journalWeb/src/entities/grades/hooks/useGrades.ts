import { ttl } from '@/shared/config'
import { CACHE_KEYS } from '@/shared/lib'
import { storage } from '@/shared/lib/storage'
import { getIsOnline } from '@/shared/model/networkStore'
import { useEffect, useRef } from 'react'
import { gradesApi } from '../api'
import { useGradesStore } from '../model/store'
import type { GradeEntry } from '../model/types'

export function resetGradesFetch() {}

export function useGrades() {
	const { entries, status, error, loadedAt, update } = useGradesStore()

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (fetchingRef.current) return
		if (
			entries.length > 0 &&
			loadedAt &&
			Date.now() - loadedAt < ttl.ACTIVITY * 1000
		) {
			if (status === 'idle') update({ status: 'success' })
			return
		}

		if (!getIsOnline()) {
			if (loadedAt !== null) {
				if (status === 'idle') update({ status: 'success' })
				return
			}
			update({ status: 'error', error: 'Нет подключения к интернету' })
			return
		}

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

		fetchingRef.current = true
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
				if (entries.length === 0)
					update({ status: 'error', error: 'Не удалось загрузить оценки' })
			})
			.finally(() => {
				fetchingRef.current = false
			})
	}, [])

	const refresh = () => {
		if (fetchingRef.current) return
		storage.remove(CACHE_KEYS.GRADES_ALL)
		fetchingRef.current = true
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
				fetchingRef.current = false
			})
	}

	return { entries, status, error, refresh }
}
