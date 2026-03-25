import { ttl } from '@/shared/config'
import { isCacheValid } from '@/shared/lib'
import { useEffect, useRef } from 'react'
import { examApi } from '../api'
import { useExamStore } from '../model/store'

const CACHE_TTL_MS = ttl.ACTIVITY * 1000

export function useExamResults() {
	const results = useExamStore(s => s.results)
	const status = useExamStore(s => s.resultsStatus)
	const loadedAt = useExamStore(s => s.resultsLoadedAt)
	const setResults = useExamStore(s => s.setResults)
	const setStatus = useExamStore(s => s.setResultsStatus)
	const setLoadedAt = useExamStore(s => s.setResultsLoadedAt)

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (fetchingRef.current) return
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return

		fetchingRef.current = true
		setStatus('loading')

		examApi
			.getExams()
			.then(data => {
				setResults(data)
				setLoadedAt(Date.now())
				setStatus('success')
			})
			.catch(() => setStatus('error'))
			.finally(() => {
				fetchingRef.current = false
			})
	}, [loadedAt])

	return { exams: results, status }
}
