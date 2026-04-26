import { useGradesStore } from '@/entities/grades'
import { useScheduleStore } from '@/entities/schedule'
import { getTodayString } from '@/shared/utils/dateUtils'
import { useEffect, useRef } from 'react'

function invalidateAll() {
	useScheduleStore.setState({
		todayLoadedAt: null,
		todayStatus: 'idle',
		today: [],
	})
	useGradesStore.setState({ loadedAt: null, status: 'idle' })
}

export function useMidnightRefresh() {
	const lastDateRef = useRef(getTodayString())

	useEffect(() => {
		function handleVisibilityChange() {
			if (document.visibilityState !== 'visible') return
			const today = getTodayString()
			if (today !== lastDateRef.current) {
				lastDateRef.current = today
				invalidateAll()
			}
		}

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
				lastDateRef.current = getTodayString()
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
