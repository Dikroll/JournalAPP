import type { SortKey } from '@/entities/grades'
import { create } from 'zustand'

interface SortSubjectsState {
	sortKey: SortKey
	setSortKey: (key: SortKey) => void
}

export const useSortSubjectsStore = create<SortSubjectsState>()(set => ({
	sortKey: 'alpha',
	setSortKey: sortKey => set({ sortKey }),
}))
