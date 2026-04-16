import { ttl } from '@/shared/config'
import { useEntityFetch } from '@/shared/hooks/useEntityFetch'
import { examApi } from '../api'
import { useExamStore } from '../model/store'

const CACHE_TTL_MS = ttl.SCHEDULE * 1000

/**
 * ИСПРАВЛЕНИЕ: заменён дублированный паттерн fetchingRef + useEffect.
 * Теперь используется useEntityFetch из shared/hooks.
 */
export function useFutureExams() {
	const exams = useExamStore(s => s.exams)
	const status = useExamStore(s => s.status)
	const loadedAt = useExamStore(s => s.loadedAt)
	const setExams = useExamStore(s => s.setExams)
	const setStatus = useExamStore(s => s.setStatus)
	const setLoadedAt = useExamStore(s => s.setLoadedAt)

	useEntityFetch({
		loadedAt,
		ttlMs: CACHE_TTL_MS,
		status,
		fetchFn: () => examApi.getFutureExams(),
		onStart: () => setStatus('loading'),
		onSuccess: data => {
			setExams(data)
			setLoadedAt(Date.now())
			setStatus('success')
		},
		onError: () => setStatus('error'),
		onCacheHit: () => setStatus('success'),
	})

	return { exams, status }
}
