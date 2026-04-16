import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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

export const useGradesStore = create<GradesState>()(
	persist(
		set => ({
			entries: [],
			status: 'idle',
			error: null,
			loadedAt: null,
			bySubject: {},

			update: patch => set(patch),

			updateSubject: (specId, patch) =>
				set(state => {
					const current = state.bySubject[specId] ?? {
						entries: [],
						status: 'idle',
						loadedAt: null,
					}

					return {
						bySubject: {
							...state.bySubject,
							[specId]: {
								...current,
								...patch,
							},
						},
					}
				}),

			reset: () =>
				set({
					entries: [],
					status: 'idle',
					error: null,
					loadedAt: null,
					bySubject: {},
				}),
		}),
		{
			name: 'grades-store',
			partialize: state => ({
				entries: state.entries,
				loadedAt: state.loadedAt,
				bySubject: Object.fromEntries(
					Object.entries(state.bySubject).map(([k, v]) => [
						k,
						{ entries: v.entries, status: 'idle', loadedAt: v.loadedAt },
					]),
				),
			}),
		},
	),
)
