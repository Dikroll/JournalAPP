import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExamResult, FutureExamItem } from './types'

interface ExamState {
	exams: FutureExamItem[]
	status: LoadingState
	loadedAt: number | null
	setExams: (exams: FutureExamItem[]) => void
	setStatus: (s: LoadingState) => void
	setLoadedAt: (t: number) => void

	results: ExamResult[]
	resultsStatus: LoadingState
	resultsLoadedAt: number | null
	setResults: (results: ExamResult[]) => void
	setResultsStatus: (s: LoadingState) => void
	setResultsLoadedAt: (t: number) => void
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

			results: [],
			resultsStatus: 'idle' as LoadingState,
			resultsLoadedAt: null,
			setResults: results => set({ results }),
			setResultsStatus: resultsStatus => set({ resultsStatus }),
			setResultsLoadedAt: resultsLoadedAt => set({ resultsLoadedAt }),
		}),
		{
			name: 'exam-store',
			partialize: state => ({
				exams: state.exams,
				loadedAt: state.loadedAt,
				results: state.results,
				resultsLoadedAt: state.resultsLoadedAt,
			}),
			onRehydrateStorage: () => state => {
				if (state) {
					state.status = 'idle'
					state.resultsStatus = 'idle'
				}
			},
		},
	),
)
