import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FutureExamItem } from './types'

interface ExamState {
	exams: FutureExamItem[]
	status: LoadingState
	loadedAt: number | null
	setExams: (exams: FutureExamItem[]) => void
	setStatus: (s: LoadingState) => void
	setLoadedAt: (t: number) => void
}

export const useExamStore = create<ExamState>()(
	persist(
		set => ({
			exams: [],
			status: 'idle' as LoadingState,
			loadedAt: null,
			setExams: exams => set({ exams }),
			setStatus: status => set({ status }),
			setLoadedAt: loadedAt => set({ loadedAt }),
		}),
		{
			name: 'exam-store',
			partialize: state => ({
				exams: state.exams,
				loadedAt: state.loadedAt,
			}),
			onRehydrateStorage: () => state => {
				if (state) state.status = 'idle'
			},
		},
	),
)
