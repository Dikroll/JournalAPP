import { useEffect, useRef } from 'react'
import { isCacheValid } from '../lib/isCacheValid'

interface UseEntityFetchOptions<T> {
	/** Уже загруженные данные — если есть и кеш валиден, запрос не делается */
	loadedAt: number | null
	/** TTL в миллисекундах */
	ttlMs: number
	/** Статус загрузки — пропускаем если уже идёт */
	status: string
	/** Функция загрузки — должна вернуть Promise */
	fetchFn: () => Promise<T>
	/** Коллбек при успехе */
	onSuccess: (data: T) => void
	/** Коллбек при ошибке — опционально */
	onError?: (err: unknown) => void
	/** Вызывается при начале загрузки */
	onStart?: () => void
}

/**
 * Универсальный хук для загрузки данных с кешированием.
 * Заменяет повторяющийся паттерн fetchingRef + isCacheValid + setStatus
 * в useFutureExams, useExamResults, usePayment, useReviews, useSubjects и др.
 *
 * @example
 * useEntityFetch({
 *   loadedAt,
 *   ttlMs: CACHE_TTL_MS,
 *   status,
 *   fetchFn: () => examApi.getFutureExams(),
 *   onStart: () => setStatus('loading'),
 *   onSuccess: (data) => { setExams(data); setLoadedAt(Date.now()); setStatus('success') },
 *   onError: () => setStatus('error'),
 * })
 */
export function useEntityFetch<T>({
	loadedAt,
	ttlMs,
	status,
	fetchFn,
	onSuccess,
	onError,
	onStart,
}: UseEntityFetchOptions<T>) {
	const fetchingRef = useRef(false)

	useEffect(() => {
		if (fetchingRef.current) return
		if (status === 'loading') return
		if (isCacheValid(loadedAt, ttlMs)) return

		fetchingRef.current = true
		onStart?.()

		fetchFn()
			.then(data => {
				onSuccess(data)
			})
			.catch(err => {
				onError?.(err)
			})
			.finally(() => {
				fetchingRef.current = false
			})
	}, [loadedAt]) // eslint-disable-line react-hooks/exhaustive-deps
}
