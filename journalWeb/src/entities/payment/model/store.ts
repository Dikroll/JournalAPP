import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import type { PaymentIndex, PaymentSummary } from './types'

interface PaymentState {
	summary: PaymentSummary | null
	summaryStatus: LoadingState
	summaryLoadedAt: number | null

	index: PaymentIndex | null
	indexStatus: LoadingState
	indexLoadedAt: number | null

	setSummary: (data: PaymentSummary) => void
	setSummaryStatus: (s: LoadingState) => void
	setSummaryLoadedAt: (t: number) => void

	setIndex: (data: PaymentIndex) => void
	setIndexStatus: (s: LoadingState) => void
	setIndexLoadedAt: (t: number) => void

	reset: () => void
}

export const usePaymentStore = create<PaymentState>()(set => ({
	summary: null,
	summaryStatus: 'idle',
	summaryLoadedAt: null,

	index: null,
	indexStatus: 'idle',
	indexLoadedAt: null,

	setSummary: summary => set({ summary }),
	setSummaryStatus: summaryStatus => set({ summaryStatus }),
	setSummaryLoadedAt: summaryLoadedAt => set({ summaryLoadedAt }),

	setIndex: index => set({ index }),
	setIndexStatus: indexStatus => set({ indexStatus }),
	setIndexLoadedAt: indexLoadedAt => set({ indexLoadedAt }),

	reset: () =>
		set({
			summary: null,
			summaryStatus: 'idle',
			summaryLoadedAt: null,
			index: null,
			indexStatus: 'idle',
			indexLoadedAt: null,
		}),
}))
