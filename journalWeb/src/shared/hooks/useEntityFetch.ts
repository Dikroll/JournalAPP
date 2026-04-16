import { useEffect, useRef } from 'react'
import { isCacheValid } from '../lib/isCacheValid'
import { getIsOnline } from '../model/networkStore'

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
 * Offline-aware: если нет сети и есть кешированные данные — показываем стэйл.
 * Если нет сети и данных нет — вызываем onError.
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

		if (!getIsOnline()) {
			if (loadedAt !== null) return
			onError?.(new Error('Нет подключения к интернету'))
			return
		}

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
