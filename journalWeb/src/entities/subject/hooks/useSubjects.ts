import { ttl } from '@/shared/config'
import { useEntityFetch } from '@/shared/hooks/useEntityFetch'
import { subjectApi } from '../api'
import { useSubjectStore } from '../model/store'

const CACHE_TTL_MS = ttl.LEADERBOARD * 1000

export function resetSubjectsFetch() {}

export function useSubjects() {
	const subjects = useSubjectStore(s => s.subjects)
	const status = useSubjectStore(s => s.status)
	const loadedAt = useSubjectStore(s => s.loadedAt)
	const setSubjects = useSubjectStore(s => s.setSubjects)
	const setStatus = useSubjectStore(s => s.setStatus)
	const setLoadedAt = useSubjectStore(s => s.setLoadedAt)

	useEntityFetch({
		loadedAt,
		ttlMs: CACHE_TTL_MS,
		status,
		fetchFn: () => subjectApi.getAll(),
		onStart: () => setStatus('loading'),
		onSuccess: data => {
			setSubjects(data)
			setLoadedAt(Date.now())
			setStatus('success')
		},
		onError: () => setStatus('error'),
		onCacheHit: () => setStatus('success'),
	})

	return { subjects, status }
}
