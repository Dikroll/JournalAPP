import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import type { GradeEntry } from './types'

interface SubjectData {
	entries: GradeEntry[]
	status: LoadingState
	loadedAt: number | null
}

interface GradesState {
	entries: GradeEntry[]
	status: LoadingState
	error: string | null
	loadedAt: number | null
	bySubject: Record<number, SubjectData>

	update: (
		patch: Partial<
			Pick<GradesState, 'entries' | 'status' | 'error' | 'loadedAt'>
		>,
	) => void
	updateSubject: (specId: number, patch: Partial<SubjectData>) => void
	reset: () => void
}

export const useGradesStore = create<GradesState>()(set => ({
	entries: [],
	status: 'idle',
	error: null,
	loadedAt: null,
	bySubject: {},

	update: patch => set(patch),

	updateSubject: (specId, patch) =>
		set(state => ({
			bySubject: {
				...state.bySubject,
				[specId]: {
					entries: [],
					status: 'idle',
					loadedAt: null,
					...state.bySubject[specId],
					...patch,
				},
			},
		})),

	reset: () =>
		set({
			entries: [],
			status: 'idle',
			error: null,
			loadedAt: null,
			bySubject: {},
		}),
}))
