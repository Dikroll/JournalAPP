import { ttl } from '@/shared/config/cache'
import { useEffect, useRef } from 'react'
import { examApi } from '../api'
import { useExamStore } from '../model/store'

const CACHE_TTL_MS = ttl.SCHEDULE * 1000

export function useFutureExams() {
	const exams = useExamStore(s => s.exams)
	const status = useExamStore(s => s.status)
	const loadedAt = useExamStore(s => s.loadedAt)
	const setExams = useExamStore(s => s.setExams)
	const setStatus = useExamStore(s => s.setStatus)
	const setLoadedAt = useExamStore(s => s.setLoadedAt)

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (loadedAt && Date.now() - loadedAt < CACHE_TTL_MS) return
		if (fetchingRef.current) return

		fetchingRef.current = true
		setStatus('loading')

		examApi
			.getFutureExams()
			.then(data => {
				setExams(data)
				setLoadedAt(Date.now())
				setStatus('success')
			})
			.catch(() => setStatus('error'))
			.finally(() => {
				fetchingRef.current = false
			})
	}, [loadedAt])

	return { exams, status }
}
