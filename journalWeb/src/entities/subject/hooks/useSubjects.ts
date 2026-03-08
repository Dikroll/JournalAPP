import { useEffect } from 'react'
import { subjectApi } from '../api'
import { useSubjectStore } from '../model/store'

const CACHE_TTL_MS = 60 * 60 * 1000

let fetching = false

export function useSubjects() {
	const subjects = useSubjectStore(s => s.subjects)
	const status = useSubjectStore(s => s.status)
	const loadedAt = useSubjectStore(s => s.loadedAt)
	const setSubjects = useSubjectStore(s => s.setSubjects)
	const setStatus = useSubjectStore(s => s.setStatus)
	const setLoadedAt = useSubjectStore(s => s.setLoadedAt)

	useEffect(() => {
		if (loadedAt && Date.now() - loadedAt < CACHE_TTL_MS) return
		if (fetching) return

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
