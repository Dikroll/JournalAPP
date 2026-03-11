import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Subject } from './types'

interface SubjectState {
	subjects: Subject[]
	status: 'idle' | 'loading' | 'success' | 'error'
	loadedAt: number | null

	setSubjects: (subjects: Subject[]) => void
	setStatus: (s: SubjectState['status']) => void
	setLoadedAt: (t: number) => void
}

export const useSubjectStore = create<SubjectState>()(
	persist(
		set => ({
			subjects: [],
			status: 'idle' as const,
			loadedAt: null,

			setSubjects: subjects => set({ subjects }),
			setStatus: status => set({ status }),
			setLoadedAt: loadedAt => set({ loadedAt }),
		}),
		{
			name: 'subject-store',
			partialize: state => ({
				subjects: state.subjects,
				loadedAt: state.loadedAt,
			}),
			onRehydrateStorage: () => state => {
				if (state) state.status = 'idle'
			},
		},
	),
)
