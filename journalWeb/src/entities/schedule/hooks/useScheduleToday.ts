import { getIsOnline } from '@/shared/model/networkStore'
import { getTodayString } from '@/shared/utils'
import { useEffect, useRef } from 'react'
import { scheduleApi } from '../api'
import { SCHEDULE_CACHE_VERSION, useScheduleStore } from '../model/store'
import type { LessonItem } from '../model/types'

const FETCH_TIMEOUT_MS = 15_000

let inFlightPromise: Promise<LessonItem[]> | null = null
let sessionInitialized = false
let lastVisitDate: string | null = null

function isLoadedToday(timestamp: number): boolean {
	const loadedDate = new Date(timestamp)
	return (
		getTodayString() ===
		`${loadedDate.getFullYear()}-${String(loadedDate.getMonth() + 1).padStart(
			2,
			'0',
		)}-${String(loadedDate.getDate()).padStart(2, '0')}`
	)
}

function fetchTodayDeduped(): Promise<LessonItem[]> {
	if (inFlightPromise) return inFlightPromise
	inFlightPromise = scheduleApi.getToday().finally(() => {
		inFlightPromise = null
	})
	return inFlightPromise
}

export function resetScheduleTodayFetch() {
	sessionInitialized = false
	inFlightPromise = null
}

export function useScheduleToday() {
	const today = useScheduleStore(s => s.today)
	const todayStatus = useScheduleStore(s => s.todayStatus)
	const todayLoadedAt = useScheduleStore(s => s.todayLoadedAt)
	const cacheVersion = useScheduleStore(s => s.cacheVersion)
	const error = useScheduleStore(s => s.error)
	const setToday = useScheduleStore(s => s.setToday)
	const setTodayStatus = useScheduleStore(s => s.setTodayStatus)
	const setTodayLoadedAt = useScheduleStore(s => s.setTodayLoadedAt)
	const setError = useScheduleStore(s => s.setError)
	const resetAllCache = useScheduleStore(s => s.resetAllCache)

	const fetchingRef = useRef(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (fetchingRef.current) return

		// Проверяем версию кэша - если версия изменилась, сбрасываем всё
		if (cacheVersion !== SCHEDULE_CACHE_VERSION) {
			console.log('[Schedule] Версия кэша устарела:', {
				cached: cacheVersion,
				current: SCHEDULE_CACHE_VERSION,
			})
			resetAllCache()
			sessionInitialized = false
			return
		}

		if (fetchingRef.current) return

		// Сбрасываем сессию при переходе на новый день
		const todayStr = getTodayString()
		if (lastVisitDate !== todayStr) {
			console.log('[Schedule] День изменился, сбрасываем кэш:', {
				lastVisitDate,
				todayStr,
			})
			lastVisitDate = todayStr
			sessionInitialized = false
		}

		const hasCachedToday =
			todayLoadedAt !== null && isLoadedToday(todayLoadedAt)

		console.log('[Schedule] Проверка кэша:', {
			todayLoadedAt,
			hasCachedToday,
			todayStatus,
			sessionInitialized,
			'today.length': today.length,
		})

		if (todayLoadedAt !== null && !hasCachedToday) {
			console.log('[Schedule] Кэш устарел, очищаем')
			sessionInitialized = false
			setToday([])
			setTodayLoadedAt(null)
			setTodayStatus('idle')
			setError(null)
			return
		}

		if (hasCachedToday) {
			console.log('[Schedule] Используем кэшированные данные')
			if (todayStatus === 'idle') setTodayStatus('success')
			return
		}

		if (!getIsOnline()) {
			if (todayLoadedAt !== null) {
				if (todayStatus === 'idle') setTodayStatus('success')
				return
			}
			setTodayStatus('error')
			setError('Нет подключения к интернету')
			return
		}

		// Only fetch if we haven't initialized in this session
		if (sessionInitialized) {
			console.log('[Schedule] Уже инициализирована сессия, пропускаем')
			return
		}
		console.log('[Schedule] Начинаем fetch')
		sessionInitialized = true

		fetchingRef.current = true
		if (today.length === 0) setTodayStatus('loading')

		timeoutRef.current = setTimeout(() => {
			if (fetchingRef.current) {
				fetchingRef.current = false
				if (today.length === 0) {
					setTodayStatus('error')
					setError('Превышено время ожидания')
				}
			}
		}, FETCH_TIMEOUT_MS)

		fetchTodayDeduped()
			.then(data => {
				console.log(
					'[Schedule] Данные загружены, получено элементов:',
					data.length,
				)
				setToday(data)
				setTodayLoadedAt(Date.now())
				setTodayStatus('success')
			})
			.catch(err => {
				console.error('[Schedule] Ошибка загрузки:', err)
				const msg =
					(err as { response?: { data?: { detail?: string } } })?.response?.data
						?.detail ?? 'Ошибка загрузки расписания'
				setError(msg)
				if (today.length === 0) setTodayStatus('error')
			})
			.finally(() => {
				fetchingRef.current = false
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
					timeoutRef.current = null
				}
			})
	}, [cacheVersion, todayLoadedAt])

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	return { today, status: todayStatus, error }
}
