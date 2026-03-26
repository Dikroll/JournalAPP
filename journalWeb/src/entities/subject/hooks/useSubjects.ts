import { isCacheValid } from '@/shared/lib'
import { useEffect, useRef } from 'react'
import { subjectApi } from '../api'
import { useSubjectStore } from '../model/store'

const CACHE_TTL_MS = 60 * 60 * 1000

export function resetSubjectsFetch() {}

export function useSubjects() {
	const { subjects, status, loadedAt, setSubjects, setStatus, setLoadedAt } =
		useSubjectStore()

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (fetchingRef.current) return
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return

		fetchingRef.current = true
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
				fetchingRef.current = false
			})
	}, [loadedAt])

	return { subjects, status }
}
