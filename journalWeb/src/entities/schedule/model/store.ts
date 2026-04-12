import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import type { LessonItem } from './types'

interface ScheduleState {
	today: LessonItem[]
	todayStatus: LoadingState
	todayLoadedAt: number | null
	error: string | null

	months: Record<string, LessonItem[]> // 'YYYY-MM'
	monthStatus: Record<string, LoadingState>
	monthLoadedAt: Record<string, number>

	weeks: Record<string, LessonItem[]> // 'YYYY-MM-DD'
	weekStatus: Record<string, LoadingState>
	weekLoadedAt: Record<string, number>

	setToday: (lessons: LessonItem[]) => void
	setTodayStatus: (s: LoadingState) => void
	setTodayLoadedAt: (t: number) => void
	setError: (e: string | null) => void

	setMonth: (date: string, lessons: LessonItem[]) => void
	setMonthStatus: (date: string, s: LoadingState) => void
	setMonthLoadedAt: (date: string, t: number) => void
	clearMonthsCache: () => void

	setWeek: (date: string, lessons: LessonItem[]) => void
	setWeekStatus: (date: string, s: LoadingState) => void
	setWeekLoadedAt: (date: string, t: number) => void
	clearWeeksCache: () => void
}

export const useScheduleStore = create<ScheduleState>()(set => ({
	today: [],
	todayStatus: 'idle',
	todayLoadedAt: null,
	error: null,
	months: {},
	monthStatus: {},
	monthLoadedAt: {},
	weeks: {},
	weekStatus: {},
	weekLoadedAt: {},

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
	clearMonthsCache: () => set({ monthLoadedAt: {} }),

	setWeek: (date, lessons) =>
		set(state => ({ weeks: { ...state.weeks, [date]: lessons } })),
	setWeekStatus: (date, s) =>
		set(state => ({ weekStatus: { ...state.weekStatus, [date]: s } })),
	setWeekLoadedAt: (date, t) =>
		set(state => ({ weekLoadedAt: { ...state.weekLoadedAt, [date]: t } })),
	clearWeeksCache: () => set({ weekLoadedAt: {} }),
}))
