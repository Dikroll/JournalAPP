import { ttl } from '@/shared/config'
import { isCacheValid } from '@/shared/lib'
import { useEffect, useRef } from 'react'
import { examApi } from '../api'
import { useExamStore } from '../model/store'

const CACHE_TTL_MS = ttl.SCHEDULE * 1000

export function useFutureExams() {
	const { exams, status, loadedAt, setExams, setStatus, setLoadedAt } =
		useExamStore()

	const fetchingRef = useRef(false)

	useEffect(() => {
		if (fetchingRef.current) return
		if (isCacheValid(loadedAt, CACHE_TTL_MS)) return

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
