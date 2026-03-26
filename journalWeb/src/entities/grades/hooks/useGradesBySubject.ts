import { isCacheValid } from '@/shared/lib'
import { useCallback } from 'react'
import { gradesApi } from '../api'
import { useGradesStore } from '../model/store'

const CACHE_TTL_MS = 15 * 60 * 1000
const fetching = new Set<number>()

export function useGradesBySubject() {
	const bySubject = useGradesStore(s => s.bySubject)
	const updateSubject = useGradesStore(s => s.updateSubject)

	const loadSubject = useCallback(async (specId: number, force = false) => {
		if (fetching.has(specId)) return

		const existing = useGradesStore.getState().bySubject[specId]
		if (!force && isCacheValid(existing?.loadedAt ?? null, CACHE_TTL_MS)) return

		fetching.add(specId)
		updateSubject(specId, { status: 'loading' })

		try {
			const data = await gradesApi.getBySubject(specId)
			updateSubject(specId, {
				entries: data,
				status: 'success',
				loadedAt: Date.now(),
			})
		} catch {
			updateSubject(specId, { status: 'error' })
		} finally {
			fetching.delete(specId)
		}
	}, [])

	return { bySubject, loadSubject }
}
