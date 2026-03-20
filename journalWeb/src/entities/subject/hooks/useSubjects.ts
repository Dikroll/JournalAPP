import { isCacheValid } from '@/shared/lib'
import { useEffect } from 'react'
import { subjectApi } from '../api'
import { useSubjectStore } from '../model/store'

const CACHE_TTL_MS = 60 * 60 * 1000

let fetching = false
export function resetSubjectsFetch() {
	fetching = false
}

export function useSubjects() {
	const { subjects, status, loadedAt, setSubjects, setStatus, setLoadedAt } =
		useSubjectStore()

	useEffect(() => {
		if (fetching) return
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return

		fetching = true
		setStatus('loading')

		subjectApi
			.getAll()
			.then(data => {
				setSubjects(data)
				setLoadedAt(Date.now())
				setStatus('success')
			})
			.catch(() => setStatus('error'))
			.finally(() => {
				fetching = false
			})
	}, [loadedAt])

	return { subjects, status }
}
