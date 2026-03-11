import { useGradesStore } from '@/entities/grades'
import { useScheduleStore } from '@/entities/schedule'
import { useEffect, useRef } from 'react'

/** Локальная дата клиента 'YYYY-MM-DD' — без UTC сдвига */
function getLocalDateString() {
	const now = new Date()
	const y = now.getFullYear()
	const m = String(now.getMonth() + 1).padStart(2, '0')
	const d = String(now.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

function invalidateAll() {
	useScheduleStore.setState({
		todayLoadedAt: null,
		todayStatus: 'idle',
		today: [],
	})
	useGradesStore.setState({ loadedAt: null, status: 'idle' })
}

export function useMidnightRefresh() {
	const lastDateRef = useRef(getLocalDateString())

	useEffect(() => {
		// Проверяем дату при возврате на вкладку — никаких запросов, только сравнение строк
		function handleVisibilityChange() {
			if (document.visibilityState !== 'visible') return
			const today = getLocalDateString()
			if (today !== lastDateRef.current) {
				lastDateRef.current = today
				invalidateAll()
			}
		}

		// Таймер до локальной полуночи — если вкладка открыта всю ночь
		function scheduleNextMidnight() {
			const now = new Date()
			const tomorrow = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() + 1,
				0,
				0,
				5,
			)
			const timer = setTimeout(() => {
				lastDateRef.current = getLocalDateString()
				invalidateAll()
				scheduleNextMidnight()
			}, tomorrow.getTime() - now.getTime())
			return timer
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)
		const timer = scheduleNextMidnight()

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
			clearTimeout(timer)
		}
	}, [])
}
