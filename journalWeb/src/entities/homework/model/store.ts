import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HomeworkCounters, HomeworkItem, HomeworkStatus } from './types'

export const PREVIEW_SIZE = 6
export const PAGE_SIZE = 6

export interface SubjectData {
	specId: number
	specName: string
	counters: HomeworkCounters | null
	items: Record<number, HomeworkItem[]>
	pages: Record<number, number>
	expandedStatuses: Set<number>
	status: LoadingState
	loadedAt: number | null
}

interface HomeworkState {
	items: Record<number, HomeworkItem[]>
	pages: Record<number, number>
	expandedStatuses: Set<number>
	counters: HomeworkCounters | null
	status: LoadingState
	error: string | null
	filterStatus: HomeworkStatus | null
	loadedAt: number | null

	setItems: (statusKey: number, items: HomeworkItem[]) => void
	appendItems: (
		statusKey: number,
		newItems: HomeworkItem[],
		page: number,
	) => void
	setExpanded: (statusKey: number, expanded: boolean) => void
	setCounters: (counters: HomeworkCounters) => void
	setStatus: (s: LoadingState) => void
	setError: (e: string | null) => void
	setFilter: (f: HomeworkStatus | null) => void
	setLoadedAt: (t: number) => void
	removeItem: (homeworkId: number) => void

	knownSpecs: Array<{ specId: number; specName: string }>
	subjects: Record<number, SubjectData>

	setKnownSpecs: (specs: Array<{ specId: number; specName: string }>) => void
	setSubjectData: (
		specId: number,
		specName: string,
		counters: HomeworkCounters,
		items: Record<number, HomeworkItem[]>,
	) => void
	appendSubjectItems: (
		specId: number,
		statusKey: number,
		newItems: HomeworkItem[],
		page: number,
	) => void
	setSubjectExpanded: (
		specId: number,
		statusKey: number,
		expanded: boolean,
	) => void
	setSubjectStatus: (specId: number, status: LoadingState) => void

	invalidate: () => void
	reset: () => void
}

function filterItems(
	items: Record<number, HomeworkItem[]>,
	homeworkId: number,
): Record<number, HomeworkItem[]> {
	return Object.fromEntries(
		Object.entries(items).map(([key, list]) => [
			key,
			list.filter(hw => hw.id !== homeworkId),
		]),
	)
}

export const useHomeworkStore = create<HomeworkState>()(
	persist(
		set => ({
			items: {},
			pages: {},
			expandedStatuses: new Set(),
			counters: null,
			status: 'idle',
			error: null,
			filterStatus: null,
			loadedAt: null,

			setItems: (statusKey, items) =>
				set(state => {
					const nextExpanded = new Set(state.expandedStatuses)
					nextExpanded.delete(statusKey)
					return {
						items: { ...state.items, [statusKey]: items },
						pages: { ...state.pages, [statusKey]: 1 },
						expandedStatuses: nextExpanded,
					}
				}),

			appendItems: (statusKey, newItems, page) =>
				set(state => ({
					items: {
						...state.items,
						[statusKey]: [...(state.items[statusKey] ?? []), ...newItems],
					},
					pages: { ...state.pages, [statusKey]: page },
				})),

			setExpanded: (statusKey, expanded) =>
				set(state => {
					const next = new Set(state.expandedStatuses)
					expanded ? next.add(statusKey) : next.delete(statusKey)
					return { expandedStatuses: next }
				}),

			setCounters: counters => set({ counters }),
			setStatus: status => set({ status }),
			setError: error => set({ error }),
			setFilter: filterStatus => set({ filterStatus }),
			setLoadedAt: loadedAt => set({ loadedAt }),

			removeItem: homeworkId =>
				set(state => ({
					items: filterItems(state.items, homeworkId),
					subjects: Object.fromEntries(
						Object.entries(state.subjects).map(([specId, subjectData]) => [
							specId,
							{
								...subjectData,
								items: filterItems(subjectData.items, homeworkId),
							},
						]),
					),
				})),

			knownSpecs: [],
			subjects: {},

			setKnownSpecs: specs => set({ knownSpecs: specs }),

			setSubjectData: (specId, specName, counters, items) =>
				set(state => ({
					subjects: {
						...state.subjects,
						[specId]: {
							specId,
							specName,
							counters,
							items,
							pages: Object.fromEntries(
								Object.keys(items).map(k => [k, 1]),
							),
							expandedStatuses: new Set(),
							status: 'success' as LoadingState,
							loadedAt: Date.now(),
						},
					},
				})),

			appendSubjectItems: (specId, statusKey, newItems, page) =>
				set(state => {
					const existing = state.subjects[specId]
					if (!existing) return state
					return {
						subjects: {
							...state.subjects,
							[specId]: {
								...existing,
								items: {
									...existing.items,
									[statusKey]: [
										...(existing.items[statusKey] ?? []),
										...newItems,
									],
								},
								pages: { ...existing.pages, [statusKey]: page },
							},
						},
					}
				}),

			setSubjectExpanded: (specId, statusKey, expanded) =>
				set(state => {
					const existing = state.subjects[specId]
					if (!existing) return state
					const next = new Set(existing.expandedStatuses)
					expanded ? next.add(statusKey) : next.delete(statusKey)
					return {
						subjects: {
							...state.subjects,
							[specId]: { ...existing, expandedStatuses: next },
						},
					}
				}),

			setSubjectStatus: (specId, status) =>
				set(state => {
					const existing = state.subjects[specId]
					if (!existing) return state
					return {
						subjects: {
							...state.subjects,
							[specId]: { ...existing, status },
						},
					}
				}),

			invalidate: () => set({ loadedAt: null }),

			reset: () =>
				set({
					items: {},
					pages: {},
					expandedStatuses: new Set(),
					counters: null,
					status: 'idle',
					error: null,
					filterStatus: null,
					loadedAt: null,
					knownSpecs: [],
					subjects: {},
				}),
		}),
		{
			name: 'homework-store',
			partialize: state => ({
				items: state.items,
				pages: state.pages,
				counters: state.counters,
				loadedAt: state.loadedAt,
				knownSpecs: state.knownSpecs,
				subjects: Object.fromEntries(
					Object.entries(state.subjects).map(([k, v]) => [
						k,
						{
							...v,
							expandedStatuses: Array.from(v.expandedStatuses),
							status: 'idle',
						},
					]),
				),
				expandedStatuses: Array.from(state.expandedStatuses),
			}),
			onRehydrateStorage: () => state => {
				if (!state) return
				state.expandedStatuses = new Set(
					state.expandedStatuses as unknown as number[],
				)
				state.status = 'idle'
				for (const sub of Object.values(state.subjects)) {
					sub.expandedStatuses = new Set(
						sub.expandedStatuses as unknown as number[],
					)
					sub.status = 'idle'
				}
			},
		},
	),
)
