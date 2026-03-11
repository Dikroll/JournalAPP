import { create } from 'zustand'

export type SortKey = 'alpha' | 'grade-desc' | 'grade-asc'

interface SortSubjectsState {
	sortKey: SortKey
	setSortKey: (key: SortKey) => void
}

export const useSortSubjectsStore = create<SortSubjectsState>()(set => ({
	sortKey: 'alpha',
	setSortKey: sortKey => set({ sortKey }),
}))
