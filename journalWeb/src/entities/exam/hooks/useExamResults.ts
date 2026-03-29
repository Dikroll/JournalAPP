import { ttl } from '@/shared/config'
import { useEntityFetch } from '@/shared/hooks/useEntityFetch'
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

	useEntityFetch({
		loadedAt,
		ttlMs: CACHE_TTL_MS,
		status,
		fetchFn: () => examApi.getExams(),
		onStart: () => setStatus('loading'),
		onSuccess: data => {
			setResults(data)
			setLoadedAt(Date.now())
			setStatus('success')
		},
		onError: () => setStatus('error'),
	})

	return { exams: results, status }
}
