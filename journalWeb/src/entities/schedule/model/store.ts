import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LessonItem } from './types'

// Версия кэша - обновляется при изменении API
export const SCHEDULE_CACHE_VERSION = 2

interface ScheduleState {
	cacheVersion: number

	today: LessonItem[]
	todayStatus: LoadingState
	todayLoadedAt: number | null
	error: string | null

	days: Record<string, LessonItem[]> // 'YYYY-MM-DD'
	dayStatus: Record<string, LoadingState>
	dayLoadedAt: Record<string, number>

	months: Record<string, LessonItem[]> // 'YYYY-MM'
	monthStatus: Record<string, LoadingState>
	monthLoadedAt: Record<string, number>

	weeks: Record<string, LessonItem[]> // 'YYYY-MM-DD'
	weekStatus: Record<string, LoadingState>
	weekLoadedAt: Record<string, number>

	setToday: (lessons: LessonItem[]) => void
	setTodayStatus: (s: LoadingState) => void
	setTodayLoadedAt: (t: number | null) => void
	setError: (e: string | null) => void

	setDay: (date: string, lessons: LessonItem[]) => void
	setDayStatus: (date: string, s: LoadingState) => void
	setDayLoadedAt: (date: string, t: number) => void

	setMonth: (date: string, lessons: LessonItem[]) => void
	setMonthStatus: (date: string, s: LoadingState) => void
	setMonthLoadedAt: (date: string, t: number) => void
	clearMonthsCache: () => void

	setWeek: (date: string, lessons: LessonItem[]) => void
	setWeekStatus: (date: string, s: LoadingState) => void
	setWeekLoadedAt: (date: string, t: number) => void
	clearWeeksCache: () => void

	resetAllCache: () => void
}

export const useScheduleStore = create<ScheduleState>()(
	persist(
		set => ({
			cacheVersion: SCHEDULE_CACHE_VERSION,

			today: [],
			todayStatus: 'idle',
			todayLoadedAt: null,
			error: null,
			days: {},
			dayStatus: {},
			dayLoadedAt: {},
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

			setDay: (date, lessons) =>
				set(state => ({ days: { ...state.days, [date]: lessons } })),
			setDayStatus: (date, s) =>
				set(state => ({
					dayStatus: { ...state.dayStatus, [date]: s },
				})),
			setDayLoadedAt: (date, t) =>
				set(state => ({
					dayLoadedAt: { ...state.dayLoadedAt, [date]: t },
				})),

			setMonth: (date, lessons) =>
				set(state => ({ months: { ...state.months, [date]: lessons } })),
			setMonthStatus: (date, s) =>
				set(state => ({
					monthStatus: { ...state.monthStatus, [date]: s },
				})),
			setMonthLoadedAt: (date, t) =>
				set(state => ({
					monthLoadedAt: { ...state.monthLoadedAt, [date]: t },
				})),
			clearMonthsCache: () => set({ monthLoadedAt: {} }),

			setWeek: (date, lessons) =>
				set(state => ({ weeks: { ...state.weeks, [date]: lessons } })),
			setWeekStatus: (date, s) =>
				set(state => ({
					weekStatus: { ...state.weekStatus, [date]: s },
				})),
			setWeekLoadedAt: (date, t) =>
				set(state => ({
					weekLoadedAt: { ...state.weekLoadedAt, [date]: t },
				})),
			clearWeeksCache: () => set({ weekLoadedAt: {} }),

			resetAllCache: () =>
				set({
					cacheVersion: SCHEDULE_CACHE_VERSION,
					today: [],
					todayStatus: 'idle',
					todayLoadedAt: null,
					error: null,
					days: {},
					dayStatus: {},
					dayLoadedAt: {},
					months: {},
					monthStatus: {},
					monthLoadedAt: {},
					weeks: {},
					weekStatus: {},
					weekLoadedAt: {},
				}),
		}),
		{
			name: 'schedule-store',
			partialize: state => ({
				cacheVersion: state.cacheVersion,
				today: state.today,
				todayLoadedAt: state.todayLoadedAt,
				days: state.days,
				dayLoadedAt: state.dayLoadedAt,
				months: state.months,
				monthLoadedAt: state.monthLoadedAt,
				weeks: state.weeks,
				weekLoadedAt: state.weekLoadedAt,
			}),
		},
	),
)
