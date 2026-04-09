import { ttl } from '@/shared/config/cacheConfig'
import { isCacheValid } from '@/shared/lib/isCacheValid'
import { useEffect, useRef } from 'react'
import { feedbackApi } from '../api'
import { useFeedbackStore } from '../model/store'

const CACHE_TTL_MS = ttl.FEEDBACK * 1000
const FETCH_TIMEOUT_MS = 15_000

export function useFeedback() {
	const pending = useFeedbackStore(s => s.pending)
	const pendingStatus = useFeedbackStore(s => s.pendingStatus)
	const pendingLoadedAt = useFeedbackStore(s => s.pendingLoadedAt)
	const tags = useFeedbackStore(s => s.tags)
	const tagsStatus = useFeedbackStore(s => s.tagsStatus)
	const tagsLoadedAt = useFeedbackStore(s => s.tagsLoadedAt)
	const error = useFeedbackStore(s => s.error)

	const setPending = useFeedbackStore(s => s.setPending)
	const setPendingStatus = useFeedbackStore(s => s.setPendingStatus)
	const setPendingLoadedAt = useFeedbackStore(s => s.setPendingLoadedAt)
	const setTags = useFeedbackStore(s => s.setTags)
	const setTagsStatus = useFeedbackStore(s => s.setTagsStatus)
	const setTagsLoadedAt = useFeedbackStore(s => s.setTagsLoadedAt)
	const setError = useFeedbackStore(s => s.setError)

	const fetchingPendingRef = useRef(false)
	const fetchingTagsRef = useRef(false)
	const timeoutPendingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const timeoutTagsRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Fetch pending
	useEffect(() => {
		if (fetchingPendingRef.current) return
		if (isCacheValid(pendingLoadedAt, CACHE_TTL_MS)) return

		fetchingPendingRef.current = true
		setPendingStatus('loading')

		timeoutPendingRef.current = setTimeout(() => {
			if (fetchingPendingRef.current) {
				fetchingPendingRef.current = false
				setPendingStatus('error')
				setError('Превышено время ожидания')
			}
		}, FETCH_TIMEOUT_MS)

		feedbackApi
			.getPending()
			.then(data => {
				setPending(data)
				setPendingLoadedAt(Date.now())
				setPendingStatus('success')
			})
			.catch(err => {
				const msg =
					(err as { response?: { data?: { detail?: string } } })?.response
						?.data?.detail ?? 'Ошибка загрузки оценок занятий'
				setError(msg)
				setPendingStatus('error')
			})
			.finally(() => {
				fetchingPendingRef.current = false
				if (timeoutPendingRef.current) {
					clearTimeout(timeoutPendingRef.current)
					timeoutPendingRef.current = null
				}
			})
	}, [pendingLoadedAt])

	// Fetch tags
	useEffect(() => {
		if (fetchingTagsRef.current) return
		if (isCacheValid(tagsLoadedAt, CACHE_TTL_MS)) return

		fetchingTagsRef.current = true
		setTagsStatus('loading')

		timeoutTagsRef.current = setTimeout(() => {
			if (fetchingTagsRef.current) {
				fetchingTagsRef.current = false
				setTagsStatus('error')
			}
		}, FETCH_TIMEOUT_MS)

		feedbackApi
			.getTags()
			.then(data => {
				setTags(data)
				setTagsLoadedAt(Date.now())
				setTagsStatus('success')
			})
			.catch(() => {
				setTagsStatus('error')
			})
			.finally(() => {
				fetchingTagsRef.current = false
				if (timeoutTagsRef.current) {
					clearTimeout(timeoutTagsRef.current)
					timeoutTagsRef.current = null
				}
			})
	}, [tagsLoadedAt])

	// Cleanup timeouts
	useEffect(() => {
		return () => {
			if (timeoutPendingRef.current) clearTimeout(timeoutPendingRef.current)
			if (timeoutTagsRef.current) clearTimeout(timeoutTagsRef.current)
		}
	}, [])

	return { pending, pendingStatus, tags, tagsStatus, error }
}
