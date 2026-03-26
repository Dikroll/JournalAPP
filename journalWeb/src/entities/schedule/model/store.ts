import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import type { LessonItem } from './types'

interface ScheduleState {
	today: LessonItem[]
	todayStatus: LoadingState
	todayLoadedAt: number | null
	error: string | null

	// Кеш по месяцам: ключ — 'YYYY-MM'
	months: Record<string, LessonItem[]>
	monthStatus: Record<string, LoadingState>
	monthLoadedAt: Record<string, number>

	setToday: (lessons: LessonItem[]) => void
	setTodayStatus: (s: LoadingState) => void
	setTodayLoadedAt: (t: number) => void
	setError: (e: string | null) => void

	setMonth: (date: string, lessons: LessonItem[]) => void
	setMonthStatus: (date: string, s: LoadingState) => void
	setMonthLoadedAt: (date: string, t: number) => void
}

export const useScheduleStore = create<ScheduleState>()(set => ({
	today: [],
	todayStatus: 'idle',
	todayLoadedAt: null,
	error: null,
	months: {},
	monthStatus: {},
	monthLoadedAt: {},

	setToday: today => set({ today }),
	setTodayStatus: todayStatus => set({ todayStatus }),
	setTodayLoadedAt: todayLoadedAt => set({ todayLoadedAt }),
	setError: error => set({ error }),

	setMonth: (date, lessons) =>
		set(state => ({ months: { ...state.months, [date]: lessons } })),
	setMonthStatus: (date, s) =>
		set(state => ({ monthStatus: { ...state.monthStatus, [date]: s } })),
	setMonthLoadedAt: (date, t) =>
		set(state => ({ monthLoadedAt: { ...state.monthLoadedAt, [date]: t } })),
}))
